import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Receipt, CalendarRange, Loader2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiRequest } from '@/lib/api';
import DataPagination from '@/components/DataPagination';
import PageLoader from '@/components/PageLoader';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileDocuments from '@/pages/mobile/MobileDocuments';

interface DonationReceipt {
  id: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  status: string;
  downloadUrl: string;
}

interface Schedule {
  id: string;
  amount: number;
  currency: string;
  category: string;
  frequency: string;
  nextPayment: string | null;
  pdfUrl: string;
  excelUrl: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function Documents() {
  const { isDataLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [receiptPage, setReceiptPage] = useState(1);
  const [receiptPageSize, setReceiptPageSize] = useState(10);
  const [schedulePage, setSchedulePage] = useState(1);
  const [schedulePageSize, setSchedulePageSize] = useState(10);
  const isMobile = useIsMobile();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await apiRequest<any>('/api/documents/available');
      if (res.ok && res.data?.success) {
        setReceipts(res.data.data?.donationReceipts || []);
        setSchedules(res.data.data?.schedules || []);
      }
      setLoading(false);
    };
    void load();
  }, []);

  const sortedReceipts = useMemo(
    () => [...receipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [receipts]
  );
  const pagedReceipts = sortedReceipts.slice((receiptPage - 1) * receiptPageSize, receiptPage * receiptPageSize);
  const pagedSchedules = schedules.slice((schedulePage - 1) * schedulePageSize, schedulePage * schedulePageSize);

  const handleDownload = async (url: string, filename: string) => {
    setDownloading(url);
    try {
      const token = localStorage.getItem('magb_access_token');
      const response = await fetch(`${API_BASE}${url}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Erreur téléchargement');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback: ouvrir dans un nouvel onglet
      window.open(`${API_BASE}${url}`, '_blank');
    }
    setDownloading(null);
  };

  const fmt = (m: number, c: string) => c === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  const formatCategory = (cat: string) => {
    const map: Record<string, string> = {
      don_mensuel: 'Mensuel', don_trimestriel: 'Trimestriel', don_semestriel: 'Semestriel',
      don_ponctuel: 'Ponctuel', don_libre: 'Libre',
    };
    return map[cat] || cat;
  };

  const formatFrequency = (f: string) => {
    const map: Record<string, string> = {
      daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel',
      quarterly: 'Trimestriel', yearly: 'Annuel',
    };
    return map[f] || f;
  };

  if (isDataLoading || loading) {
    return <AppLayout><div className="container max-w-6xl py-8 px-4"><PageLoader message="Chargement des documents..." /></div></AppLayout>;
  }

  if (isMobile) return <AppLayout><MobileDocuments /></AppLayout>;

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Mes documents</h1>
        </div>
        <p className="text-muted-foreground mb-8">Téléchargez vos reçus de dons et échéanciers</p>

        <Tabs defaultValue="receipts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="receipts" className="gap-2">
              <Receipt className="w-4 h-4" /> Reçus ({receipts.length})
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2">
              <CalendarRange className="w-4 h-4" /> Échéanciers ({schedules.length})
            </TabsTrigger>
          </TabsList>

          {/* Reçus */}
          <TabsContent value="receipts">
            <Card className="border-border">
              <CardContent className="p-0">
                {receipts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Aucun reçu disponible</p>
                    <p className="text-xs mt-1">Les reçus sont générés pour les dons complétés</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Télécharger</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedReceipts.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(r.date), 'dd/MM/yyyy', { locale: fr })}
                              </TableCell>
                              <TableCell>{formatCategory(r.category)}</TableCell>
                              <TableCell className="font-medium whitespace-nowrap">{fmt(r.amount, r.currency)}</TableCell>
                              <TableCell>
                                <Badge variant={r.status === 'completed' ? 'default' : 'secondary'}>
                                  {r.status === 'completed' ? 'Complété' : 'En attente'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {r.status === 'completed' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                    disabled={downloading === r.downloadUrl}
                                    onClick={() => handleDownload(r.downloadUrl, `recu_${r.id.slice(-6)}.pdf`)}
                                  >
                                    {downloading === r.downloadUrl ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4" />
                                    )}
                                    PDF
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                    <AlertCircle className="w-3 h-3" /> Non disponible
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <DataPagination
                      page={receiptPage}
                      pageSize={receiptPageSize}
                      total={receipts.length}
                      onPageChange={setReceiptPage}
                      onPageSizeChange={v => { setReceiptPageSize(v); setReceiptPage(1); }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Échéanciers */}
          <TabsContent value="schedules">
            <Card className="border-border">
              <CardContent className="p-0">
                {schedules.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarRange className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Aucun échéancier disponible</p>
                    <p className="text-xs mt-1">Créez un don récurrent pour générer un échéancier</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Fréquence</TableHead>
                            <TableHead>Prochain paiement</TableHead>
                            <TableHead className="text-right">Télécharger</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedSchedules.map(s => (
                            <TableRow key={s.id}>
                              <TableCell>{formatCategory(s.category)}</TableCell>
                              <TableCell className="font-medium whitespace-nowrap">{fmt(s.amount, s.currency)}</TableCell>
                              <TableCell>{formatFrequency(s.frequency)}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {s.nextPayment ? format(new Date(s.nextPayment), 'dd/MM/yyyy', { locale: fr }) : '—'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                    disabled={downloading === s.pdfUrl}
                                    onClick={() => handleDownload(s.pdfUrl, `echeancier_${s.id.slice(-6)}.pdf`)}
                                  >
                                    {downloading === s.pdfUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                    PDF
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                    disabled={downloading === s.excelUrl}
                                    onClick={() => handleDownload(s.excelUrl, `echeancier_${s.id.slice(-6)}.xlsx`)}
                                  >
                                    {downloading === s.excelUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                                    Excel
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <DataPagination
                      page={schedulePage}
                      pageSize={schedulePageSize}
                      total={schedules.length}
                      onPageChange={setSchedulePage}
                      onPageSizeChange={v => { setSchedulePageSize(v); setSchedulePage(1); }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
