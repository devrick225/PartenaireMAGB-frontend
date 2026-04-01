import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Heart, Search, Eye, Calendar, CreditCard, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import DataPagination from '@/components/DataPagination';
import PageLoader from '@/components/PageLoader';

interface AdminUserLite {
  id: string;
  fullName: string;
  email: string;
}

interface AdminContribution {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'ponctuelle' | 'recurrente';
  frequence?: 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';
  montant: number;
  devise: 'FCFA' | 'USD';
  dateCreation: string;
  datesEngagement: string[];
  statut: 'en_attente' | 'payee' | 'annulee';
}

interface AdminPayment {
  id: string;
  contributionId: string;
  montant: number;
  devise: 'FCFA' | 'USD';
  date: string;
  statut: 'succes' | 'echoue' | 'en_attente';
  reference: string;
}

export default function AdminDonations() {
  const { isAdmin } = useAuth();
  const [searchDon, setSearchDon] = useState('');
  const [detailDonOpen, setDetailDonOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<any>(null);
  const [contributions, setContributions] = useState<AdminContribution[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingReport, setDownloadingReport] = useState(false);

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      const usersRes = await apiRequest<any>('/api/users?limit=200');
      if (!usersRes.ok || !usersRes.data?.success) {
        setLoading(false);
        return;
      }

      const mappedUsers: AdminUserLite[] = (usersRes.data.data?.users || []).map((u: any) => ({
        id: u._id,
        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Inconnu',
        email: u.email || '',
      }));

      const userDonationsResponses = await Promise.all(
        mappedUsers.map(u => apiRequest<any>(`/api/users/${u.id}/donations?limit=100`))
      );
      const allDonations = userDonationsResponses
        .filter(r => r.ok && r.data?.success)
        .flatMap(r => r.data?.data?.donations || []);

      const mappedContributions: AdminContribution[] = allDonations.map((d: any) => {
        const owner = mappedUsers.find(u => u.id === d.user);
        const frequencyMap: Record<string, AdminContribution['frequence']> = {
          monthly: 'mensuelle',
          quarterly: 'trimestrielle',
          yearly: 'annuelle',
        };
        const status = d.status === 'completed' ? 'payee' : d.status === 'failed' || d.status === 'cancelled' ? 'annulee' : 'en_attente';
        return {
          id: d._id,
          userId: d.user,
          userName: owner?.fullName || 'Inconnu',
          userEmail: owner?.email || '',
          type: d.type === 'recurring' ? 'recurrente' : 'ponctuelle',
          frequence: d.type === 'recurring' ? (frequencyMap[d.recurring?.frequency] || 'mensuelle') : undefined,
          montant: Number(d.amount || 0),
          devise: d.currency === 'USD' ? 'USD' : 'FCFA',
          dateCreation: d.createdAt || new Date().toISOString(),
          datesEngagement: [d.recurring?.startDate, d.recurring?.nextPaymentDate].filter(Boolean),
          statut: status,
        };
      });
      setContributions(mappedContributions);

      const paymentsRes = await apiRequest<any>('/api/payments?limit=500');
      if (paymentsRes.ok && paymentsRes.data?.success) {
        const mappedPayments: AdminPayment[] = (paymentsRes.data.data?.payments || []).map((p: any) => ({
          id: p._id,
          contributionId: p.donation?._id || p.donation || '',
          montant: Number(p.amount || 0),
          devise: p.currency === 'USD' ? 'USD' : 'FCFA',
          date: p.createdAt || new Date().toISOString(),
          statut: p.status === 'completed' ? 'succes' : p.status === 'failed' || p.status === 'cancelled' || p.status === 'refunded' ? 'echoue' : 'en_attente',
          reference: p.transaction?.reference || p.transaction?.externalId || p._id,
        }));
        setPayments(mappedPayments);
      }

      setLoading(false);
    };

    void loadAll();
  }, []);

  const enrichedContributions = useMemo(() => {
    return contributions
      .filter(c => `${c.userName} ${c.userEmail}`.toLowerCase().includes(searchDon.toLowerCase()))
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [contributions, searchDon]);

  const pagedContributions = useMemo(
    () => enrichedContributions.slice((page - 1) * pageSize, page * pageSize),
    [enrichedContributions, page, pageSize]
  );

  const formatMontant = (m: number, d: string) =>
    d === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  const totalDons = payments.filter(p => p.statut === 'succes').reduce((sum, p) =>
    sum + (p.devise === 'USD' ? p.montant * 600 : p.montant), 0
  );

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const token = localStorage.getItem('magb_access_token');
      const response = await fetch(`${API_BASE}/api/documents/donations-report`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_dons_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback
      window.open(`${API_BASE}/api/documents/donations-report`, '_blank');
    }
    setDownloadingReport(false);
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl py-8 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Gestion des dons</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          {contributions.length} contribution(s) — Total : {totalDons.toLocaleString()} FCFA
        </p>

        <div className="flex justify-end mb-4">
          <Button variant="outline" className="gap-2" onClick={handleDownloadReport} disabled={downloadingReport}>
            {downloadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Rapport Excel
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="font-display text-lg">Toutes les contributions</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher par nom..." value={searchDon} onChange={e => { setSearchDon(e.target.value); setPage(1); }} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Détail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><PageLoader message="Chargement des contributions..." /></TableCell></TableRow>
                  ) : pagedContributions.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucune contribution trouvée</TableCell></TableRow>
                  ) : pagedContributions.map(c => {
                    const contribPayments = payments.filter(p => p.contributionId === c.id);
                    return (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedContribution({ ...c, payments: contribPayments }); setDetailDonOpen(true); }}>
                        <TableCell className="font-medium">{c.userName}</TableCell>
                        <TableCell className="capitalize">{c.type}</TableCell>
                        <TableCell>{formatMontant(c.montant, c.devise)}</TableCell>
                        <TableCell className="capitalize">{c.frequence || '—'}</TableCell>
                        <TableCell>{format(new Date(c.dateCreation), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                        <TableCell>
                          <Badge variant={c.statut === 'payee' ? 'default' : c.statut === 'en_attente' ? 'secondary' : 'destructive'}>
                            {c.statut === 'payee' ? 'Payée' : c.statut === 'en_attente' ? 'En attente' : 'Annulée'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Eye className="w-4 h-4 text-muted-foreground" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <DataPagination
              page={page}
              pageSize={pageSize}
              total={enrichedContributions.length}
              onPageChange={setPage}
              onPageSizeChange={v => { setPageSize(v); setPage(1); }}
            />
          </CardContent>
        </Card>

        {/* Detail dialog */}
        <Dialog open={detailDonOpen} onOpenChange={setDetailDonOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">Détail de la contribution</DialogTitle></DialogHeader>
            {selectedContribution && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Donateur</p>
                    <p className="text-sm font-medium text-foreground">{selectedContribution.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{selectedContribution.userEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Montant</p>
                    <p className="text-sm font-bold text-foreground">{formatMontant(selectedContribution.montant, selectedContribution.devise)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm capitalize text-foreground">{selectedContribution.type}</p>
                  </div>
                  {selectedContribution.frequence && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Fréquence</p>
                      <p className="text-sm capitalize text-foreground">{selectedContribution.frequence}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Date de création</p>
                    <p className="text-sm text-foreground">{format(new Date(selectedContribution.dateCreation), 'dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <Badge variant={selectedContribution.statut === 'payee' ? 'default' : selectedContribution.statut === 'en_attente' ? 'secondary' : 'destructive'}>
                      {selectedContribution.statut === 'payee' ? 'Payée' : selectedContribution.statut === 'en_attente' ? 'En attente' : 'Annulée'}
                    </Badge>
                  </div>
                </div>

                {selectedContribution.datesEngagement?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      Dates d'engagement ({selectedContribution.datesEngagement.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedContribution.datesEngagement.map((d: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{format(new Date(d), 'dd/MM/yyyy', { locale: fr })}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Paiements associés ({selectedContribution.payments?.length || 0})
                  </div>
                  {selectedContribution.payments?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedContribution.payments.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 text-sm">
                          <div>
                            <p className="font-medium text-foreground">{formatMontant(p.montant, p.devise)}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(p.date), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={p.statut === 'succes' ? 'default' : p.statut === 'en_attente' ? 'secondary' : 'destructive'}>
                              {p.statut === 'succes' ? 'Succès' : p.statut === 'en_attente' ? 'En attente' : 'Échoué'}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Réf: {p.reference}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucun paiement enregistré</p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDonOpen(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
