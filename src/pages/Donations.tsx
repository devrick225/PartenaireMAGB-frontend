import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Heart, CalendarIcon, CheckCircle, ListOrdered, Plus, Download, FileText, FileSpreadsheet, CreditCard, Loader2, XCircle, Smartphone } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import DataPagination from '@/components/DataPagination';
import PageLoader from '@/components/PageLoader';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileDonations from '@/pages/mobile/MobileDonations';

export default function Donations() {
  const { user, contributions, payments, addContribution, initializePayment, verifyPaymentStatus, isDataLoading } = useAuth();
  const isMobile = useIsMobile();
  const [type, setType] = useState<'ponctuelle' | 'recurrente'>('ponctuelle');
  const [frequence, setFrequence] = useState<'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle'>('mensuelle');
  const [montant, setMontant] = useState('');
  const [devise, setDevise] = useState<'FCFA' | 'USD'>('FCFA');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'choose' | 'processing' | 'result'>('choose');
  const [paymentResult, setPaymentResult] = useState<'succes' | 'echoue' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [isVerifyingNow, setIsVerifyingNow] = useState(false);
  // Pagination contributions
  const [contribPage, setContribPage] = useState(1);
  const [contribPageSize, setContribPageSize] = useState(10);
  // Pagination paiements
  const [payPage, setPayPage] = useState(1);
  const [payPageSize, setPayPageSize] = useState(10);
  const pendingContribution = useRef<{ type: typeof type; frequence?: typeof frequence; montant: number; devise: typeof devise; datesEngagement: string[] } | null>(null);
  useEffect(() => {
    if (!activePaymentId || paymentStep !== 'processing') return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20; // ~2 minutes avec intervalle de 6s

    const pollStatus = async () => {
      attempts += 1;
      const result = await verifyPaymentStatus(activePaymentId);
      if (cancelled) return;

      if (!result.success) {
        if (attempts >= maxAttempts) {
          setPaymentResult('echoue');
          setPaymentStep('result');
          setActivePaymentId(null);
          toast.error(result.error || 'Vérification du paiement impossible.');
        }
        return;
      }

      if (result.status === 'completed') {
        setPaymentResult('succes');
        setPaymentStep('result');
        setActivePaymentId(null);
        toast.success('Paiement confirmé avec succès !');
        return;
      }

      if (result.status === 'failed') {
        setPaymentResult('echoue');
        setPaymentStep('result');
        setActivePaymentId(null);
        toast.error('Le paiement a échoué.');
        return;
      }

      if (attempts >= maxAttempts) {
        setPaymentResult('echoue');
        setPaymentStep('result');
        setActivePaymentId(null);
        toast.error('Délai de confirmation dépassé. Vérifiez à nouveau dans "Mes paiements".');
      }
    };

    void pollStatus();
    const intervalId = window.setInterval(() => {
      void pollStatus();
    }, 6000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activePaymentId, paymentStep, verifyPaymentStatus]);

  const lastPaymentRef = useRef<string>(`PAY-${Date.now().toString().slice(-8)}`);

  const generateReceipt = async () => {
    const c = pendingContribution.current;
    if (!c) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const ref = lastPaymentRef.current;
    const now = new Date();

    // Header
    doc.setFillColor(89, 55, 107);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('REÇU DE PAIEMENT', 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Mouvement des Anciens du Groupe Biblique', 105, 32, { align: 'center' });

    // Reset color
    doc.setTextColor(0, 0, 0);

    // Reference & date
    doc.setFontSize(10);
    doc.text(`Référence : ${ref}`, 14, 58);
    doc.text(`Date : ${format(now, 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 14, 65);

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 72, 196, 72);

    // Donor info
    doc.setFontSize(12);
    doc.setFont(undefined!, 'bold');
    doc.text('Informations du donateur', 14, 82);
    doc.setFont(undefined!, 'normal');
    doc.setFontSize(10);
    doc.text(`Nom : ${user?.prenoms || ''} ${user?.nom || ''}`, 14, 90);
    doc.text(`Email : ${user?.email || ''}`, 14, 97);
    doc.text(`Téléphone : ${user?.telephone || ''}`, 14, 104);

    // Separator
    doc.line(14, 111, 196, 111);

    // Payment details
    doc.setFontSize(12);
    doc.setFont(undefined!, 'bold');
    doc.text('Détails du paiement', 14, 121);
    doc.setFont(undefined!, 'normal');
    doc.setFontSize(10);

    const details = [
      ['Type de don', c.type === 'recurrente' ? `Récurrent (${c.frequence})` : 'Ponctuel'],
      ['Montant', formatMontant(c.montant, c.devise)],
      ['Mode de paiement', paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Carte bancaire'],
      ['Statut', 'Payé ✓'],
    ];

    let y = 130;
    details.forEach(([label, value]) => {
      doc.setFont(undefined!, 'bold');
      doc.text(`${label} :`, 14, y);
      doc.setFont(undefined!, 'normal');
      doc.text(value, 70, y);
      y += 8;
    });

    // Engagement dates
    if (c.datesEngagement.length > 1) {
      y += 5;
      doc.setFont(undefined!, 'bold');
      doc.text('Dates d\'engagement :', 14, y);
      doc.setFont(undefined!, 'normal');
      y += 8;
      c.datesEngagement.forEach(d => {
        doc.text(`• ${format(new Date(d), 'dd MMMM yyyy', { locale: fr })}`, 20, y);
        y += 6;
      });
    }

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 260, 196, 260);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('Ce reçu est généré automatiquement et fait foi de votre contribution.', 105, 268, { align: 'center' });
    doc.text(`Document généré le ${format(now, 'dd/MM/yyyy à HH:mm')}`, 105, 274, { align: 'center' });

    doc.save(`recu_${ref}.pdf`);
    toast.success('Reçu téléchargé !');
  };

  const minAmount = devise === 'FCFA' ? 200 : 1;
  const maxAmount = devise === 'FCFA' ? 2_000_000 : 3_500; // 2M FCFA ≈ 3500 USD

  const formatMontant = (m: number, d: string) =>
    d === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

    const sortedContributions = useMemo(() =>
    [...contributions].sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()),
    [contributions]
  );
  const sortedPayments = useMemo(() =>
    [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [payments]
  );
  const pagedContributions = sortedContributions.slice((contribPage - 1) * contribPageSize, contribPage * contribPageSize);
  const pagedPayments = sortedPayments.slice((payPage - 1) * payPageSize, payPage * payPageSize);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Fréquence', 'Montant', 'Devise', 'Statut'];
    const rows = contributions.map(c => [
      format(new Date(c.dateCreation), 'dd/MM/yyyy'),
      c.type,
      c.frequence || '—',
      c.montant.toString(),
      c.devise,
      c.statut,
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dons_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Historique de mes dons', 14, 22);
    doc.setFontSize(10);
    doc.text(`Exporté le ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

    autoTable(doc, {
      startY: 38,
      head: [['Date', 'Type', 'Fréquence', 'Montant', 'Statut']],
      body: contributions.map(c => [
        format(new Date(c.dateCreation), 'dd/MM/yyyy'),
        c.type,
        c.frequence || '—',
        formatMontant(c.montant, c.devise),
        c.statut === 'en_attente' ? 'En attente' : c.statut === 'payee' ? 'Payée' : 'Annulée',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [89, 55, 107] },
    });

    if (payments.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || 80;
      doc.setFontSize(14);
      doc.text('Paiements', 14, finalY + 12);

      autoTable(doc, {
        startY: finalY + 18,
        head: [['Date', 'Référence', 'Montant', 'Statut']],
        body: payments.map(p => [
          format(new Date(p.date), 'dd/MM/yyyy HH:mm'),
          p.reference,
          formatMontant(p.montant, p.devise),
          p.statut === 'succes' ? 'Succès' : p.statut === 'en_attente' ? 'En attente' : 'Échoué',
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [89, 55, 107] },
      });
    }

    doc.save(`dons_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Export PDF téléchargé');
  };

  const generateDates = (startDate: Date): string[] => {
    if (type === 'ponctuelle') return [startDate.toISOString()];
    const dates: string[] = [];
    const monthsIncrement = frequence === 'mensuelle' ? 1 : frequence === 'trimestrielle' ? 3 : frequence === 'semestrielle' ? 6 : 12;
    for (let i = 0; i < 12 / monthsIncrement; i++) {
      dates.push(addMonths(startDate, i * monthsIncrement).toISOString());
    }
    return dates;
  };

  const handleSubmit = () => {
    const amt = parseFloat(montant);
    if (!amt || amt < minAmount) {
      toast.error(`Le montant minimum est de ${minAmount.toLocaleString()} ${devise}`);
      return;
    }
    if (amt > maxAmount) {
      toast.error(`Le montant maximum est de ${maxAmount.toLocaleString()} ${devise}`);
      return;
    }
    if (!selectedDate) {
      toast.error('Veuillez sélectionner une date');
      return;
    }

    const datesEngagement = generateDates(selectedDate);
    pendingContribution.current = {
      type,
      frequence: type === 'recurrente' ? frequence : undefined,
      montant: amt,
      devise,
      datesEngagement,
    };

    setPaymentStep('choose');
    setPaymentResult(null);
    setPaymentMethod('');
    setPaymentDialogOpen(true);
  };

  const simulatePayment = async (method: string) => {
    setPaymentMethod(method);
    setPaymentStep('processing');

    if (!pendingContribution.current) {
      setPaymentResult('echoue');
      setPaymentStep('result');
      toast.error('Aucune contribution à payer.');
      return;
    }

    const c = pendingContribution.current;
    const createdContribution = await addContribution({
      type: c.type,
      frequence: c.frequence,
      montant: c.montant,
      devise: c.devise,
      datesEngagement: c.datesEngagement,
      statut: 'en_attente',
    });

    if (!createdContribution) {
      setPaymentResult('echoue');
      setPaymentStep('result');
      toast.error('Impossible de créer la contribution.');
      return;
    }

    const init = await initializePayment(
      createdContribution.id,
      method === 'stripe' ? 'stripe' : method === 'paypal' ? 'paypal' : 'mobile_money'
    );

    console.log('💳 initializePayment result:', { method, success: init.success, paymentUrl: init.paymentUrl, paymentId: init.paymentId, error: init.error });

    if (!init.success) {
      setPaymentResult('echoue');
      setPaymentStep('result');
      toast.error(init.error || 'Le paiement a échoué. Veuillez réessayer.');
      console.error('❌ Payment init failed:', init.error);
      return;
    }

    lastPaymentRef.current = init.transactionId || init.paymentId || `PAY-${Date.now()}`;

    // Stripe: rediriger vers la page de paiement Stripe
    if (method === 'stripe' && init.clientSecret && init.paymentId) {
      const params = new URLSearchParams({
        clientSecret: init.clientSecret,
        donationId: createdContribution.id,
        paymentId: init.paymentId,
        amount: String(c.montant),
        currency: c.devise === 'USD' ? 'USD' : 'XOF',
      });
      window.location.href = `/paiement/stripe?${params.toString()}`;
      return;
    }

    // PayPal: rediriger vers la page de paiement PayPal
    if (method === 'paypal' && init.paymentUrl && init.paymentId) {
      const params = new URLSearchParams({
        approvalUrl: init.paymentUrl,
        donationId: createdContribution.id,
        paymentId: init.paymentId,
        amount: String(c.montant),
        currency: c.devise === 'USD' ? 'USD' : 'XOF',
      });
      window.location.href = `/paiement/paypal?${params.toString()}`;
      return;
    }

    // MoneyFusion: rediriger vers la page de paiement
    setPaymentResult(null);
    setPaymentStep('processing');
    setActivePaymentId(init.paymentId || null);

    if (init.paymentUrl) {
      window.location.href = init.paymentUrl;
    } else {
      toast.success('Paiement initialisé avec succès.');
    }
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
    if (paymentResult === 'succes') {
      setSuccess(true);
    }
  };

  const retryPayment = () => {
    setPaymentStep('choose');
    setPaymentResult(null);
    setPaymentMethod('');
  };

  const verifyNow = async () => {
    if (!activePaymentId) {
      toast.error('Aucun paiement en cours à vérifier.');
      return;
    }

    setIsVerifyingNow(true);
    const result = await verifyPaymentStatus(activePaymentId);
    setIsVerifyingNow(false);
    if (!result.success) {
      toast.error(result.error || 'Vérification impossible pour le moment.');
      return;
    }

    if (result.status === 'completed') {
      setPaymentResult('succes');
      setPaymentStep('result');
      setActivePaymentId(null);
      toast.success('Paiement confirmé avec succès !');
      return;
    }

    if (result.status === 'failed') {
      setPaymentResult('echoue');
      setPaymentStep('result');
      setActivePaymentId(null);
      toast.error('Le paiement a échoué.');
      return;
    }

    toast.message('Paiement toujours en attente de confirmation.');
  };

  const statutBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente': return <Badge variant="secondary">En attente</Badge>;
      case 'payee': return <Badge variant="default">Payée</Badge>;
      case 'annulee': return <Badge variant="destructive">Annulée</Badge>;
      case 'succes': return <Badge variant="default">Succès</Badge>;
      case 'echoue': return <Badge variant="destructive">Échoué</Badge>;
      default: return <Badge variant="outline">{statut}</Badge>;
    }
  };

  if (isDataLoading) {
    return (
      <AppLayout>
        <div className="container max-w-6xl py-8 px-4">
          <PageLoader message="Chargement de vos dons..." />
        </div>
      </AppLayout>
    );
  }

  if (isMobile) return <AppLayout><MobileDonations /></AppLayout>;

  if (success) {
    return (
      <AppLayout>
        <div className="container max-w-2xl py-16 px-4 text-center animate-fade-in">
          <div className="mx-auto w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Merci pour votre don ! 🙏</h1>
          <p className="text-muted-foreground mb-8">
            Votre contribution a été enregistrée. L'intégration du paiement en ligne (CinetPay) sera disponible prochainement.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setSuccess(false)}>Faire un autre don</Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Tableau de bord
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8 px-4 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Mes dons</h1>
        <p className="text-muted-foreground mb-8">Gérez vos contributions et consultez votre historique</p>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="gap-2">
              <ListOrdered className="w-4 h-4" /> Historique
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-2">
              <Plus className="w-4 h-4" /> Nouveau don
            </TabsTrigger>
          </TabsList>

          {/* Historique */}
          <TabsContent value="list" className="space-y-6">
            {/* Export buttons */}
            {(contributions.length > 0 || payments.length > 0) && (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" /> Exporter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => void exportPDF()} className="gap-2 cursor-pointer">
                      <FileText className="w-4 h-4" /> Exporter en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
                      <FileSpreadsheet className="w-4 h-4" /> Exporter en CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Sub-tabs: Contributions / Paiements */}
            <Tabs defaultValue="contributions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contributions" className="gap-2">
                  <Heart className="w-4 h-4" /> Contributions ({contributions.length})
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="w-4 h-4" /> Paiements ({payments.length})
                </TabsTrigger>
              </TabsList>

              {/* Contributions */}
              <TabsContent value="contributions">
                <Card className="border-border">
                  <CardContent className="p-0">
                    {contributions.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Heart className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p>Aucune contribution enregistrée</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Fréquence</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Échéances</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pagedContributions.map(c => (
                                <TableRow key={c.id}>
                                  <TableCell className="whitespace-nowrap">
                                    {format(new Date(c.dateCreation), 'dd/MM/yyyy', { locale: fr })}
                                  </TableCell>
                                  <TableCell className="capitalize">{c.type}</TableCell>
                                  <TableCell className="capitalize">{c.frequence || '—'}</TableCell>
                                  <TableCell className="font-medium whitespace-nowrap">
                                    {formatMontant(c.montant, c.devise)}
                                  </TableCell>
                                  <TableCell>{statutBadge(c.statut)}</TableCell>
                                  <TableCell>
                                    <div className="space-y-0.5">
                                      {c.datesEngagement.map((d, i) => (
                                        <p key={i} className="text-xs text-muted-foreground">
                                          {format(new Date(d), 'dd MMM yyyy', { locale: fr })}
                                        </p>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <DataPagination
                          page={contribPage}
                          pageSize={contribPageSize}
                          total={contributions.length}
                          onPageChange={setContribPage}
                          onPageSizeChange={v => { setContribPageSize(v); setContribPage(1); }}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Paiements */}
              <TabsContent value="payments">
                <Card className="border-border">
                  <CardContent className="p-0">
                    {payments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p>Aucun paiement effectué</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Référence</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pagedPayments.map(p => (
                                <TableRow key={p.id}>
                                  <TableCell className="whitespace-nowrap">
                                    {format(new Date(p.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                                  <TableCell className="font-medium whitespace-nowrap">
                                    {formatMontant(p.montant, p.devise)}
                                  </TableCell>
                                  <TableCell>{statutBadge(p.statut)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <DataPagination
                          page={payPage}
                          pageSize={payPageSize}
                          total={payments.length}
                          onPageChange={setPayPage}
                          onPageSizeChange={v => { setPayPageSize(v); setPayPage(1); }}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Nouveau don */}
          <TabsContent value="new" className="space-y-6">
            {/* Type */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg">Type de contribution</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={type} onValueChange={v => setType(v as typeof type)} className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'ponctuelle', label: 'Ponctuelle', desc: 'Don unique' },
                    { value: 'recurrente', label: 'Récurrente', desc: 'Don périodique' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        type === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <RadioGroupItem value={opt.value} />
                      <div>
                        <p className="font-semibold text-foreground">{opt.label}</p>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                {type === 'recurrente' && (
                  <div className="mt-4 space-y-2">
                    <Label>Fréquence</Label>
                    <Select value={frequence} onValueChange={v => setFrequence(v as typeof frequence)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensuelle">Mensuelle</SelectItem>
                        <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                        <SelectItem value="semestrielle">Semestrielle</SelectItem>
                        <SelectItem value="annuelle">Annuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amount */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg">Montant</CardTitle>
                <CardDescription>Min : {minAmount.toLocaleString()} {devise} — Max : {maxAmount.toLocaleString()} {devise}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder={`Min. ${minAmount.toLocaleString()}`}
                      value={montant}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        if (val <= maxAmount) setMontant(e.target.value);
                      }}
                      min={minAmount}
                      max={maxAmount}
                    />
                  </div>
                  <Select value={devise} onValueChange={v => setDevise(v as typeof devise)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(devise === 'FCFA'
                    ? [1000, 5000, 10000, 25000, 50000, 100000]
                    : [2, 10, 25, 50, 100, 250]
                  ).map(a => (
                    <Button
                      key={a}
                      variant={montant === String(a) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMontant(String(a))}
                    >
                      {a.toLocaleString()} {devise}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {type === 'ponctuelle' ? 'Date du don' : 'Date de début'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={fr}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  className="rounded-xl border border-border"
                />
                {selectedDate && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Date sélectionnée : <span className="font-medium text-foreground">{format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</span>
                  </p>
                )}
                {selectedDate && type === 'recurrente' && (
                  <div className="mt-4 p-4 bg-muted rounded-xl w-full">
                    <p className="font-semibold text-sm text-foreground mb-2">Dates d'engagement prévues :</p>
                    <div className="space-y-1">
                      {generateDates(selectedDate).map((d, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          • {format(new Date(d), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={handleSubmit} className="w-full gap-2" size="lg">
              <Heart className="w-5 h-5" /> Confirmer et payer
            </Button>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog - MoneyFusion */}
        <Dialog open={paymentDialogOpen} onOpenChange={(open) => { if (!open && paymentStep !== 'processing') closePaymentDialog(); }}>
          <DialogContent className="sm:max-w-md">
            {paymentStep === 'choose' && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Confirmer le paiement
                  </DialogTitle>
                  <DialogDescription>
                    Montant : <span className="font-bold text-foreground">{pendingContribution.current ? formatMontant(pendingContribution.current.montant, pendingContribution.current.devise) : ''}</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <button
                    onClick={() => simulatePayment('mobile_money')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Payer avec MoneyFusion</p>
                      <p className="text-sm text-muted-foreground">Orange Money, MTN, Moov, Wave et plus</p>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Paiement sécurisé via MoneyFusion
                </p>
              </>
            )}

            {paymentStep === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <p className="text-lg font-semibold text-foreground">Traitement en cours…</p>
                <p className="text-sm text-muted-foreground">
                  Finalisez le paiement dans la page MoneyFusion ouverte, puis revenez ici.
                </p>
                <div className="flex justify-center gap-1 pt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={verifyNow} disabled={isVerifyingNow}>
                    {isVerifyingNow ? 'Vérification...' : 'Vérifier maintenant'}
                  </Button>
                </div>
              </div>
            )}

            {paymentStep === 'result' && paymentResult === 'succes' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xl font-bold text-foreground">Paiement réussi !</p>
                <p className="text-muted-foreground">
                  {pendingContribution.current ? formatMontant(pendingContribution.current.montant, pendingContribution.current.devise) : ''} — Réf: {lastPaymentRef.current}
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => void generateReceipt()} className="flex-1 gap-2">
                    <Download className="w-4 h-4" /> Télécharger le reçu
                  </Button>
                  <Button onClick={closePaymentDialog} className="flex-1">
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {paymentStep === 'result' && paymentResult === 'echoue' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <p className="text-xl font-bold text-foreground">Paiement échoué</p>
                <p className="text-muted-foreground">
                  Le paiement n'a pas pu aboutir. Veuillez réessayer.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={retryPayment} className="flex-1">
                    Réessayer
                  </Button>
                  <Button variant="outline" onClick={closePaymentDialog} className="flex-1">
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
