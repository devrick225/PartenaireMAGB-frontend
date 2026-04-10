import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileSection } from '@/components/mobile/MobileSection';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, CheckCircle, XCircle, Clock, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAGE_SIZE = 10;

export default function MobilePayments() {
  const { payments, contributions } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [page, setPage] = useState(1);

  const fmt = (m: number, d: string) => d === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  const filtered = useMemo(() => {
    setPage(1);
    let result = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (statusFilter !== 'all') result = result.filter(p => p.statut === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.reference.toLowerCase().includes(q) || fmt(p.montant, p.devise).toLowerCase().includes(q));
    }
    return result;
  }, [payments, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalSuccess = useMemo(() =>
    payments.filter(p => p.statut === 'succes').reduce((s, p) => s + (p.devise === 'USD' ? p.montant * 600 : p.montant), 0), [payments]);

  const statusIcon = (s: string) => {
    if (s === 'succes') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === 'echoue') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-orange-500" />;
  };

  const statusLabel = (s: string) => s === 'succes' ? 'Succès' : s === 'echoue' ? 'Échoué' : 'En attente';
  const statusVariant = (s: string): 'default' | 'destructive' | 'secondary' => s === 'succes' ? 'default' : s === 'echoue' ? 'destructive' : 'secondary';

  return (
    <div className="bg-muted/30 min-h-screen pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-4 pt-4 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-5 h-5 text-white/80" />
          <p className="text-white/80 text-sm">Mes paiements</p>
        </div>
        <p className="text-white text-3xl font-bold">{totalSuccess.toLocaleString()}</p>
        <p className="text-white/70 text-sm">FCFA total</p>
        <div className="flex gap-2 mt-3">
          <div className="bg-white/20 rounded-full px-3 py-1 text-white text-xs">{payments.filter(p => p.statut === 'succes').length} réussis</div>
          <div className="bg-white/20 rounded-full px-3 py-1 text-white text-xs">{payments.length} total</div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Search */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="border-0 p-0 h-auto text-sm focus-visible:ring-0 bg-transparent" />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[['all', 'Tous'], ['succes', 'Réussis'], ['en_attente', 'En attente'], ['echoue', 'Échoués']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${statusFilter === val ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border/50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun paiement trouvé</p>
          </div>
        ) : (
          <>
            <MobileSection>
              {paginated.map(p => {
                const contrib = contributions.find(c => c.id === p.contributionId);
                return (
                  <button key={p.id} onClick={() => setSelected({ ...p, contribution: contrib })}
                    className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 hover:bg-muted/50 text-left">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${p.statut === 'succes' ? 'bg-green-100 dark:bg-green-900/30' : p.statut === 'echoue' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                      {statusIcon(p.statut)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{fmt(p.montant, p.devise)}</p>
                      <p className="text-xs text-muted-foreground truncate">{format(new Date(p.date), 'dd MMM yyyy · HH:mm', { locale: fr })}</p>
                    </div>
                    <Badge variant={statusVariant(p.statut)} className="text-[10px] shrink-0">{statusLabel(p.statut)}</Badge>
                  </button>
                );
              })}
            </MobileSection>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-3 shadow-sm border border-border/50">
                <span className="text-xs text-muted-foreground">
                  {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} sur {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs font-medium px-2">{safePage}/{totalPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail sheet */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle className="font-display">Détail du paiement</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <p className="text-3xl font-bold text-foreground">{fmt(selected.montant, selected.devise)}</p>
                <Badge variant={statusVariant(selected.statut)} className="mt-2">{statusLabel(selected.statut)}</Badge>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(selected.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Référence</span>
                  <span className="font-mono text-xs">{selected.reference}</span>
                </div>
                {selected.contribution && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize">{selected.contribution.type}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setSelected(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
