import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Wallet, Search, CheckCircle, XCircle, Clock, Download, FileText, FileSpreadsheet, Eye, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DataPagination from '@/components/DataPagination';
import PageLoader, { CardSkeleton, TableSkeleton } from '@/components/PageLoader';
import { useIsMobile } from '@/hooks/use-mobile';
import MobilePayments from '@/pages/mobile/MobilePayments';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function Payments() {
  const { payments, contributions, isDataLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useIsMobile();

  const formatMontant = (m: number, d: string) =>
    d === 'USD' ? `${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  const statutBadge = (statut: string) => {
    switch (statut) {
      case 'succes': return <Badge className="bg-secondary/20 text-secondary border-secondary/30"><CheckCircle className="w-3 h-3 mr-1" />Succès</Badge>;
      case 'echoue': return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Échoué</Badge>;
      default: return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
    }
  };

  const enrichedPayments = useMemo(() => {
    return payments.map(p => {
      const contrib = contributions.find(c => c.id === p.contributionId);
      return { ...p, contributionType: contrib?.type, contributionFrequence: contrib?.frequence };
    });
  }, [payments, contributions]);

  const filtered = useMemo(() => {
    let result = [...enrichedPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (statusFilter !== 'all') {
      result = result.filter(p => p.statut === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.reference.toLowerCase().includes(q) ||
        formatMontant(p.montant, p.devise).toLowerCase().includes(q)
      );
    }
    return result;
  }, [enrichedPayments, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const totalSuccess = useMemo(() =>
    payments.filter(p => p.statut === 'succes').reduce((s, p) => s + (p.devise === 'USD' ? p.montant * 600 : p.montant), 0),
    [payments]
  );
  const countSuccess = payments.filter(p => p.statut === 'succes').length;
  const countFailed = payments.filter(p => p.statut === 'echoue').length;

  if (isDataLoading) {
    return (
      <AppLayout>
        <div className="container max-w-7xl py-8 px-4 space-y-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <CardSkeleton count={4} />
          <Card className="border-border">
            <CardContent className="p-0">
              <TableSkeleton rows={5} cols={6} />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const exportCSV = () => {
    const header = 'Date,Référence,Montant,Devise,Statut,Type\n';
    const rows = filtered.map(p =>
      `${format(new Date(p.date), 'dd/MM/yyyy HH:mm')},${p.reference},${p.montant},${p.devise},${p.statut},${p.contributionType || ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Historique des paiements', 14, 22);
    doc.setFontSize(10);
    doc.text(`Exporté le ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`, 14, 30);

    const tableData = filtered.map(p => [
      format(new Date(p.date), 'dd/MM/yyyy HH:mm'),
      p.reference,
      formatMontant(p.montant, p.devise),
      p.statut === 'succes' ? 'Succès' : p.statut === 'echoue' ? 'Échoué' : 'En attente',
      p.contributionType === 'recurrente' ? `Récurrent (${p.contributionFrequence})` : 'Ponctuel',
    ]);

    const { default: autoTable } = await import('jspdf-autotable');
    autoTable(doc, {
      head: [['Date', 'Référence', 'Montant', 'Statut', 'Type']],
      body: tableData,
      startY: 36,
    });

    doc.save(`paiements_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  if (isMobile) return <AppLayout><MobilePayments /></AppLayout>;

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Mes paiements</h1>
        </div>
        <p className="text-muted-foreground mb-8">Consultez l'historique complet de vos transactions</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{payments.length}</p>
              <p className="text-xs text-muted-foreground">Total paiements</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">{countSuccess}</p>
              <p className="text-xs text-muted-foreground">Réussis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{countFailed}</p>
              <p className="text-xs text-muted-foreground">Échoués</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totalSuccess.toLocaleString()} FCFA</p>
              <p className="text-xs text-muted-foreground">Montant total</p>
            </CardContent>
          </Card>
        </div>

        {/* Table + Filters */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="font-display text-lg">Historique des transactions</CardTitle>
                <CardDescription>
                  {filtered.length} paiement(s) — page {safePage}/{totalPages}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 w-44"
                  />
                </div>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="succes">Succès</SelectItem>
                    <SelectItem value="echoue">Échoué</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                  </SelectContent>
                </Select>
                {filtered.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Exporter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
                        <FileText className="w-4 h-4" /> PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
                        <FileSpreadsheet className="w-4 h-4" /> CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Aucun paiement trouvé</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Détail</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map(p => {
                        const contrib = contributions.find(c => c.id === p.contributionId);
                        return (
                          <TableRow
                            key={p.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedPayment({ ...p, contribution: contrib })}
                          >
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(p.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                            <TableCell className="capitalize text-sm">
                              {p.contributionType === 'recurrente'
                                ? `Récurrent (${p.contributionFrequence})`
                                : 'Ponctuel'}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {formatMontant(p.montant, p.devise)}
                            </TableCell>
                            <TableCell>{statutBadge(p.statut)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <DataPagination
                  page={safePage}
                  pageSize={pageSize}
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={v => { setPageSize(v); setPage(1); }}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display">Détail du paiement</DialogTitle></DialogHeader>
            {selectedPayment && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Référence</p>
                    <p className="text-sm font-mono font-medium text-foreground">{selectedPayment.reference}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm text-foreground">{format(new Date(selectedPayment.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Montant</p>
                    <p className="text-sm font-bold text-foreground">{formatMontant(selectedPayment.montant, selectedPayment.devise)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Statut</p>
                    {statutBadge(selectedPayment.statut)}
                  </div>
                </div>

                {selectedPayment.contribution && (
                  <>
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Contribution associée
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="text-sm capitalize text-foreground">{selectedPayment.contribution.type}</p>
                        </div>
                        {selectedPayment.contribution.frequence && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Fréquence</p>
                            <p className="text-sm capitalize text-foreground">{selectedPayment.contribution.frequence}</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Montant contribution</p>
                          <p className="text-sm font-medium text-foreground">{formatMontant(selectedPayment.contribution.montant, selectedPayment.contribution.devise)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Créée le</p>
                          <p className="text-sm text-foreground">{format(new Date(selectedPayment.contribution.dateCreation), 'dd/MM/yyyy', { locale: fr })}</p>
                        </div>
                      </div>
                    </div>

                    {selectedPayment.contribution.datesEngagement?.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          Échéances ({selectedPayment.contribution.datesEngagement.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedPayment.contribution.datesEngagement.map((d: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {format(new Date(d), 'dd/MM/yyyy', { locale: fr })}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

