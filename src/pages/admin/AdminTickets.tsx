import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, Send, Loader2, Eye, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import DataPagination from '@/components/DataPagination';
import PageLoader from '@/components/PageLoader';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting_user', label: 'Attente utilisateur' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Fermé' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Ouvert', variant: 'secondary' },
  in_progress: { label: 'En cours', variant: 'default' },
  waiting_user: { label: 'Attente user', variant: 'outline' },
  waiting_admin: { label: 'Attente admin', variant: 'outline' },
  resolved: { label: 'Résolu', variant: 'default' },
  closed: { label: 'Fermé', variant: 'secondary' },
};

const PRIORITY_MAP: Record<string, string> = { low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' };

export default function AdminTickets() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const loadTickets = async () => {
    setLoading(true);
    const res = await apiRequest<any>('/api/tickets?limit=200');
    if (res.ok && res.data?.success) setTickets(res.data.data?.tickets || []);
    setLoading(false);
  };

  useEffect(() => { void loadTickets(); }, []);

  const filtered = useMemo(() => {
    let result = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.subject?.toLowerCase().includes(q) || t.user?.firstName?.toLowerCase().includes(q) || t.user?.email?.toLowerCase().includes(q));
    }
    return result;
  }, [tickets, statusFilter, search]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openTicket = async (ticket: any) => {
    setSelected(ticket);
    setLoadingComments(true);
    const res = await apiRequest<any>(`/api/tickets/${ticket._id}/comments`);
    if (res.ok && res.data?.success) setComments(res.data.data?.comments || []);
    else setComments([]);
    setLoadingComments(false);
  };

  const handleSendComment = async () => {
    if (!selected || newComment.length < 5) return;
    setSending(true);
    await apiRequest(`/api/tickets/${selected._id}/comments`, 'POST', { comment: newComment });
    setSending(false);
    setNewComment('');
    const r = await apiRequest<any>(`/api/tickets/${selected._id}/comments`);
    if (r.ok && r.data?.success) setComments(r.data.data?.comments || []);
    toast.success('Réponse envoyée');
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!selected) return;
    setChangingStatus(true);
    const res = await apiRequest(`/api/tickets/${selected._id}/status`, 'POST', { status: newStatus });
    setChangingStatus(false);
    if (res.ok) {
      setSelected((s: any) => s ? { ...s, status: newStatus } : s);
      setTickets(prev => prev.map(t => t._id === selected._id ? { ...t, status: newStatus } : t));
      toast.success(`Statut changé: ${STATUS_MAP[newStatus]?.label || newStatus}`);
    } else toast.error('Erreur');
  };

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
  }), [tickets]);

  if (loading) return <AppLayout><PageLoader message="Chargement des tickets..." /></AppLayout>;

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Gestion des tickets</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Ouverts', value: stats.open, color: 'text-orange-500' },
            { label: 'En cours', value: stats.inProgress, color: 'text-blue-500' },
            { label: 'Résolus', value: stats.resolved, color: 'text-green-500' },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Filters + Table */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="font-display text-lg">{filtered.length} ticket(s)</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-44" />
                </div>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>Aucun ticket</p></div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {paged.map(t => {
                    const s = STATUS_MAP[t.status] || STATUS_MAP.open;
                    return (
                      <div key={t._id} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer" onClick={() => openTicket(t)}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span>{PRIORITY_MAP[t.priority] || '⚪'}</span>
                            <p className="font-medium text-foreground truncate">{t.subject}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.user?.firstName || ''} {t.user?.lastName || ''} · {format(new Date(t.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Badge variant={s.variant}>{s.label}</Badge>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <DataPagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={v => { setPageSize(v); setPage(1); }} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail dialog */}
        <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-display truncate">{selected?.subject}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={(STATUS_MAP[selected?.status]?.variant) || 'outline'}>{STATUS_MAP[selected?.status]?.label || selected?.status}</Badge>
                <span className="text-xs text-muted-foreground">{selected?.user?.firstName} {selected?.user?.lastName} · {selected?.user?.email}</span>
              </div>
            </DialogHeader>

            {/* Change status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Statut:</span>
              <Select value={selected?.status || 'open'} onValueChange={handleChangeStatus} disabled={changingStatus}>
                <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['open', 'in_progress', 'waiting_user', 'resolved', 'closed'].map(s => (
                    <SelectItem key={s} value={s}>{STATUS_MAP[s]?.label || s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {changingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-foreground">{selected?.description}</div>
              {loadingComments ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
              ) : comments.map((c: any, i: number) => (
                <div key={i} className={`p-3 rounded-lg text-sm ${c.isAdmin ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">{c.author?.firstName || 'User'} {c.isAdmin && '(Admin)'}</span>
                    <span className="text-xs text-muted-foreground">{c.createdAt && format(new Date(c.createdAt), 'dd/MM HH:mm', { locale: fr })}</span>
                  </div>
                  <p>{c.comment || c.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Répondre..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()} />
              <Button size="icon" onClick={handleSendComment} disabled={sending || newComment.length < 5}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
