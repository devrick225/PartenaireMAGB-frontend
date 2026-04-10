import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileSection } from '@/components/mobile/MobileSection';
import { Button } from '@/components/ui/button';
import { FileText, Download, Receipt, CalendarRange, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiRequest } from '@/lib/api';
import PageLoader from '@/components/PageLoader';
import { toast } from 'sonner';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function MobileDocuments() {
  const { isDataLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [tab, setTab] = useState<'receipts' | 'schedules'>('receipts');

  useEffect(() => {
    const load = async () => {
      const res = await apiRequest<any>('/api/documents/available');
      if (res.ok && res.data?.success) {
        setReceipts(res.data.data?.donationReceipts || []);
        setSchedules(res.data.data?.schedules || []);
      }
      setLoading(false);
    };
    void load();
  }, []);

  const sortedReceipts = useMemo(() =>
    [...receipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [receipts]);

  const handleDownload = async (url: string, filename: string) => {
    setDownloading(url);
    try {
      const token = localStorage.getItem('magb_access_token');
      const response = await fetch(`${API_BASE}${url}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = filename; a.click();
      URL.revokeObjectURL(blobUrl);
    } catch { window.open(`${API_BASE}${url}`, '_blank'); }
    setDownloading(null);
  };

  const fmt = (m: number, c: string) => c === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;
  const formatCat = (cat: string) => ({ don_mensuel: 'Mensuel', don_trimestriel: 'Trimestriel', don_semestriel: 'Semestriel', don_ponctuel: 'Ponctuel' }[cat] || cat);
  const formatFreq = (f: string) => ({ daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel', quarterly: 'Trimestriel', yearly: 'Annuel' }[f] || f);

  if (isDataLoading || loading) return <PageLoader message="Chargement des documents..." />;

  return (
    <div className="bg-muted/30 min-h-screen pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-4 pt-4 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-white/80" />
          <p className="text-white/80 text-sm">Mes documents</p>
        </div>
        <p className="text-white font-bold text-xl">{receipts.length} reçu{receipts.length > 1 ? 's' : ''} disponible{receipts.length > 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Tabs */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-1 flex">
          <button onClick={() => setTab('receipts')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'receipts' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            <Receipt className="w-4 h-4" /> Reçus ({receipts.length})
          </button>
          <button onClick={() => setTab('schedules')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'schedules' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            <CalendarRange className="w-4 h-4" /> Échéanciers ({schedules.length})
          </button>
        </div>

        {tab === 'receipts' && (
          sortedReceipts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun reçu disponible</p>
              <p className="text-xs mt-1">Les reçus sont générés pour les dons complétés</p>
            </div>
          ) : (
            <MobileSection>
              {sortedReceipts.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${r.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                    <Receipt className={`w-5 h-5 ${r.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{fmt(r.amount, r.currency)}</p>
                    <p className="text-xs text-muted-foreground">{formatCat(r.category)} · {format(new Date(r.date), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                  {r.status === 'completed' ? (
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" disabled={downloading === r.downloadUrl}
                      onClick={() => handleDownload(r.downloadUrl, `recu_${r.id.slice(-6)}.pdf`)}>
                      {downloading === r.downloadUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-primary" />}
                    </Button>
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </MobileSection>
          )
        )}

        {tab === 'schedules' && (
          schedules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarRange className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun échéancier disponible</p>
            </div>
          ) : (
            <MobileSection>
              {schedules.map(s => (
                <div key={s.id} className="px-4 py-3.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{fmt(s.amount, s.currency)}</p>
                      <p className="text-xs text-muted-foreground">{formatCat(s.category)} · {formatFreq(s.frequency)}</p>
                    </div>
                    {s.nextPayment && <p className="text-xs text-muted-foreground">{format(new Date(s.nextPayment), 'dd/MM/yy', { locale: fr })}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 h-8 text-xs rounded-xl" disabled={downloading === s.pdfUrl}
                      onClick={() => handleDownload(s.pdfUrl, `echeancier_${s.id.slice(-6)}.pdf`)}>
                      {downloading === s.pdfUrl ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} PDF
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 h-8 text-xs rounded-xl" disabled={downloading === s.excelUrl}
                      onClick={() => handleDownload(s.excelUrl, `echeancier_${s.id.slice(-6)}.xlsx`)}>
                      {downloading === s.excelUrl ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Excel
                    </Button>
                  </div>
                </div>
              ))}
            </MobileSection>
          )
        )}
      </div>
    </div>
  );
}
