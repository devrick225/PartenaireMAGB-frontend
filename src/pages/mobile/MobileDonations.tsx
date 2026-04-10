import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileSection } from '@/components/mobile/MobileSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Heart, Plus, Loader2, CheckCircle, XCircle, Clock, Smartphone, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAGE_SIZE = 8;

export default function MobileDonations() {
  const { user, contributions, payments, addContribution, initializePayment, verifyPaymentStatus } = useAuth();
  const [tab, setTab] = useState<'list' | 'new'>('list');
  const [contribPage, setContribPage] = useState(1);
  const [payPage, setPayPage] = useState(1);

  // New donation form
  const [type, setType] = useState<'ponctuelle' | 'recurrente'>('ponctuelle');
  const [frequence, setFrequence] = useState<'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle'>('mensuelle');
  const [montant, setMontant] = useState('');
  const [devise, setDevise] = useState<'FCFA' | 'USD'>('FCFA');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'choose' | 'processing' | 'done'>('choose');
  const [paymentOk, setPaymentOk] = useState<boolean | null>(null);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const pendingContrib = useRef<any>(null);

  const minAmount = devise === 'FCFA' ? 200 : 1;
  const maxAmount = devise === 'FCFA' ? 2_000_000 : 3_500;
  const fmt = (m: number, d: string) => d === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  const sortedContribs = useMemo(() => [...contributions].sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()), [contributions]);
  const sortedPayments = useMemo(() => [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [payments]);

  const totalContribPages = Math.max(1, Math.ceil(sortedContribs.length / PAGE_SIZE));
  const totalPayPages = Math.max(1, Math.ceil(sortedPayments.length / PAGE_SIZE));
  const pagedContribs = sortedContribs.slice((contribPage - 1) * PAGE_SIZE, contribPage * PAGE_SIZE);
  const pagedPayments = sortedPayments.slice((payPage - 1) * PAGE_SIZE, payPage * PAGE_SIZE);

  // Poll payment status
  useEffect(() => {
    if (!activePaymentId || paymentStep !== 'processing') return;
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      const r = await verifyPaymentStatus(activePaymentId);
      if (cancelled) return;
      if (r.status === 'completed') { setPaymentOk(true); setPaymentStep('done'); setActivePaymentId(null); return; }
      if (r.status === 'failed') { setPaymentOk(false); setPaymentStep('done'); setActivePaymentId(null); return; }
      if (attempts >= 20) { setPaymentOk(false); setPaymentStep('done'); setActivePaymentId(null); }
    };
    void poll();
    const id = setInterval(() => void poll(), 6000);
    return () => { cancelled = true; clearInterval(id); };
  }, [activePaymentId, paymentStep, verifyPaymentStatus]);

  const handleSubmit = () => {
    const amt = parseFloat(montant);
    if (!amt || amt < minAmount) { toast.error(`Minimum: ${minAmount.toLocaleString()} ${devise}`); return; }
    if (amt > maxAmount) { toast.error(`Maximum: ${maxAmount.toLocaleString()} ${devise}`); return; }
    const monthsInc = frequence === 'mensuelle' ? 1 : frequence === 'trimestrielle' ? 3 : frequence === 'semestrielle' ? 6 : 12;
    const dates = type === 'ponctuelle' ? [new Date().toISOString()] :
      Array.from({ length: 12 / monthsInc }, (_, i) => addMonths(new Date(), i * monthsInc).toISOString());
    pendingContrib.current = { type, frequence: type === 'recurrente' ? frequence : undefined, montant: amt, devise, datesEngagement: dates };
    setPaymentStep('choose'); setPaymentOk(null);
    setPaymentDialogOpen(true);
  };

  const handlePay = async (method: string) => {
    setPaymentStep('processing');
    const c = pendingContrib.current;
    const created = await addContribution({ type: c.type, frequence: c.frequence, montant: c.montant, devise: c.devise, datesEngagement: c.datesEngagement, statut: 'en_attente' });
    if (!created) { setPaymentOk(false); setPaymentStep('done'); return; }
    const init = await initializePayment(created.id, method === 'stripe' ? 'stripe' : method === 'paypal' ? 'paypal' : 'mobile_money');
    if (!init.success) { setPaymentOk(false); setPaymentStep('done'); toast.error(init.error || 'Erreur'); return; }
    setActivePaymentId(init.paymentId || null);
    if (init.paymentUrl) { window.location.href = init.paymentUrl; return; }
    if (init.clientSecret && init.paymentId) {
      const params = new URLSearchParams({ clientSecret: init.clientSecret, donationId: created.id, paymentId: init.paymentId, amount: String(c.montant), currency: c.devise === 'USD' ? 'USD' : 'XOF' });
      window.location.href = `/paiement/stripe?${params}`;
    }
  };

  const statutBadge = (s: string) => {
    if (s === 'payee' || s === 'succes') return <Badge className="text-[10px] bg-green-100 text-green-700">Payé</Badge>;
    if (s === 'annulee' || s === 'echoue') return <Badge variant="destructive" className="text-[10px]">Annulé</Badge>;
    return <Badge variant="secondary" className="text-[10px]">En attente</Badge>;
  };

  const Pagination = ({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) =>
    total > 1 ? (
      <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-3 shadow-sm border border-border/50 mt-2">
        <span className="text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total * PAGE_SIZE)} sur {total * PAGE_SIZE}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => onChange(page - 1)} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-xs font-medium px-2">{page}/{total}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => onChange(page + 1)} disabled={page === total}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    ) : null;

  return (
    <div className="bg-muted/30 min-h-screen pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-4 pt-4 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-white/80" />
          <p className="text-white/80 text-sm">Mes dons</p>
        </div>
        <p className="text-white font-bold text-xl">{contributions.length} contribution{contributions.length > 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Tabs */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-1 flex">
          <button onClick={() => setTab('list')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Historique</button>
          <button onClick={() => setTab('new')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'new' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            <Plus className="w-4 h-4" /> Nouveau don
          </button>
        </div>

        {tab === 'list' && (
          <>
            {/* Contributions */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Contributions</p>
            {sortedContribs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Heart className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Aucune contribution</p></div>
            ) : (
              <>
                <MobileSection>
                  {pagedContribs.map(c => (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{fmt(c.montant, c.devise)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{c.type}{c.frequence ? ` · ${c.frequence}` : ''}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(c.dateCreation), 'dd MMM yyyy', { locale: fr })}</p>
                      </div>
                      {statutBadge(c.statut)}
                    </div>
                  ))}
                </MobileSection>
                <Pagination page={contribPage} total={totalContribPages} onChange={setContribPage} />
              </>
            )}

            {/* Paiements */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mt-4">Paiements</p>
            {sortedPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Clock className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Aucun paiement</p></div>
            ) : (
              <>
                <MobileSection>
                  {pagedPayments.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${p.statut === 'succes' ? 'bg-green-100 dark:bg-green-900/30' : p.statut === 'echoue' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                        {p.statut === 'succes' ? <CheckCircle className="w-5 h-5 text-green-500" /> : p.statut === 'echoue' ? <XCircle className="w-5 h-5 text-red-500" /> : <Clock className="w-5 h-5 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{fmt(p.montant, p.devise)}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(p.date), 'dd MMM yyyy · HH:mm', { locale: fr })}</p>
                      </div>
                      {statutBadge(p.statut)}
                    </div>
                  ))}
                </MobileSection>
                <Pagination page={payPage} total={totalPayPages} onChange={setPayPage} />
              </>
            )}
          </>
        )}

        {tab === 'new' && (
          <div className="space-y-3">
            {/* Type */}
            <MobileSection title="Type de don">
              <div className="flex p-3 gap-2">
                {[['ponctuelle', 'Ponctuel'], ['recurrente', 'Récurrent']].map(([v, l]) => (
                  <button key={v} onClick={() => setType(v as any)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors border-2 ${type === v ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {l}
                  </button>
                ))}
              </div>
              {type === 'recurrente' && (
                <div className="px-4 pb-3">
                  <Select value={frequence} onValueChange={v => setFrequence(v as any)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensuelle">Mensuelle</SelectItem>
                      <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                      <SelectItem value="semestrielle">Semestrielle</SelectItem>
                      <SelectItem value="annuelle">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </MobileSection>

            {/* Montant */}
            <MobileSection title={`Montant (${minAmount.toLocaleString()} – ${maxAmount.toLocaleString()} ${devise})`}>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <Input type="number" placeholder={`Min. ${minAmount.toLocaleString()}`} value={montant}
                    onChange={e => { const v = parseFloat(e.target.value) || 0; if (v <= maxAmount) setMontant(e.target.value); }}
                    className="flex-1 rounded-xl text-lg font-bold h-12" />
                  <Select value={devise} onValueChange={v => setDevise(v as any)}>
                    <SelectTrigger className="w-24 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="FCFA">FCFA</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(devise === 'FCFA' ? [1000, 5000, 10000, 25000, 50000, 100000] : [2, 10, 25, 50, 100, 250]).map(a => (
                    <button key={a} onClick={() => setMontant(String(a))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${montant === String(a) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                      {a.toLocaleString()} {devise}
                    </button>
                  ))}
                </div>
              </div>
            </MobileSection>

            <Button onClick={handleSubmit} className="w-full gap-2 h-12 rounded-2xl text-base" size="lg">
              <Heart className="w-5 h-5" /> Confirmer et payer
            </Button>
          </div>
        )}
      </div>

      {/* Payment dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={o => { if (!o && paymentStep !== 'processing') setPaymentDialogOpen(false); }}>
        <DialogContent className="max-w-sm mx-auto">
          {paymentStep === 'choose' && (
            <>
              <DialogHeader>
                <DialogTitle>Choisir le paiement</DialogTitle>
                <DialogDescription>Montant: <strong>{fmt(parseFloat(montant) || 0, devise)}</strong></DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <button onClick={() => handlePay('mobile_money')} className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Smartphone className="w-5 h-5 text-primary" /></div>
                  <div><p className="font-semibold text-sm">Mobile Money</p><p className="text-xs text-muted-foreground">Orange, MTN, Moov, Wave</p></div>
                </button>
              </div>
              <p className="text-xs text-center text-muted-foreground">🔒 Paiement sécurisé via MoneyFusion</p>
            </>
          )}
          {paymentStep === 'processing' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              <p className="font-semibold text-foreground">Traitement en cours…</p>
              <p className="text-sm text-muted-foreground">Finalisez le paiement puis revenez ici.</p>
            </div>
          )}
          {paymentStep === 'done' && (
            <div className="py-8 text-center space-y-3">
              {paymentOk ? <CheckCircle className="w-12 h-12 mx-auto text-green-500" /> : <XCircle className="w-12 h-12 mx-auto text-red-500" />}
              <p className="font-semibold text-foreground">{paymentOk ? 'Paiement réussi !' : 'Paiement échoué'}</p>
              <Button className="w-full rounded-xl" onClick={() => { setPaymentDialogOpen(false); setTab('list'); setMontant(''); }}>
                {paymentOk ? 'Voir mes dons' : 'Réessayer'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
