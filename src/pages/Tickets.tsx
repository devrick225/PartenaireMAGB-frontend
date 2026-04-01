import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MessageSquare, Plus, Send, Loader2, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiRequest } from '@/lib/api';
import DataPagination from '@/components/DataPagination';
import PageLoader from '@/components/PageLoader';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'technical', label: 'Technique' },
  { value: 'payment', label: 'Paiement' },
  { value: 'account', label: 'Compte' },
  { value: 'donation', label: 'Don' },
  { value: 'general', label: 'Général' },
  { value: 'suggestion', label: 'Suggestion' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Ouvert', variant: 'secondary' },
  in_progress: { label: 'En cours', variant: 'default' },
  waiting_user: { label: 'En attente', variant: 'outline' },
  waiting_admin: { label: 'En attente admin', variant: 'outline' },
  resolved: { label: 'Résolu', variant: 'default' },
  closed: { label: 'Fermé', variant: 'secondary' },
};

export default function Tickets() {
  const { isDataLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    const res = await apiRequest<any>('/api/tickets?limit=100');
    if (res.ok && res.data?.success) setTickets(res.data.data?.tickets || []);
    setLoading(false);
  };

  useEffect(() => { void loadTickets(); }, []);

  const sorted = useMemo(() =>
    [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tickets]
  );
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleCreate = async () => {
    if (subject.length < 5 || description.length < 10) {
      toast.error('Sujet (5 car. min) et description (10 car. min) requis');
      return;
    }
    setCreating(true);
    const res = await apiRequest<any>('/api/tickets', 'POST', { subject, description, category });
    setCreating(false);
    if (res.ok && res.data?.success) {
      toast.success('Ticket créé');
      setShowCreate(false);
      setSubject(''); setDescription(''); setCategory('general');
      void loadTickets();
    } else toast.error(res.data?.error || 'Erreur');
  };

  const openTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    setLoadingComments(true);
    const res = await apiRequest<any>(`/api/tickets/${ticket._id}/comments`);
    if (res.ok && res.data?.success) setComments(res.data.data?.comments || []);
    else setComments([]);
    setLoadingComments(false);
  };

  const handleSendComment = async () => {
    if (!selectedTicket || newComment.length < 5) return;
    setSendingComment(true);
    const res = await apiRequest<any>(`/api/tickets/${selectedTicket._id}/comments`, 'POST', { comment: newComment });
    setSendingComment(false);
    if (res.ok) {
      setNewComment('');
      const r2 = await apiRequest<any>(`/api/tickets/${selectedTicket._id}/comments`);
      if (r2.ok && r2.data?.success) setComments(r2.data.data?.comments || []);
      toast.success('Message envoyé');
    } else toast.error('Erreur');
  };

  if (isDataLoading || loading) return <AppLayout><PageLoader message="Chargement des tickets..." /></AppLayout>;

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8 px-4 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">Support</h1>
            </div>
            <p className="text-muted-foreground">{tickets.length} ticket(s)</p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Nouveau ticket
          </Button>
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            {sorted.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Aucun ticket</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {paged.map(t => {
                    const s = STATUS_MAP[t.status] || STATUS_MAP.open;
                    return (
                      <div key={t._id} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer" onClick={() => openTicket(t)}>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{t.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {CATEGORIES.find(c => c.value === t.category)?.label || t.category} · {format(new Date(t.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
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
                <DataPagination page={page} pageSize={pageSize} total={sorted.length} onPageChange={setPage} onPageSizeChange={v => { setPageSize(v); setPage(1); }} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Create dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau ticket</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Sujet</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Résumé du problème" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre problème en détail..." rows={4} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket detail dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={o => !o && setSelectedTicket(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-display truncate">{selectedTicket?.subject}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={(STATUS_MAP[selectedTicket?.status]?.variant) || 'outline'}>{STATUS_MAP[selectedTicket?.status]?.label || selectedTicket?.status}</Badge>
                <span className="text-xs text-muted-foreground">{selectedTicket?.createdAt && format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {/* Description */}
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-foreground">{selectedTicket?.description}</div>

              {/* Comments */}
              {loadingComments ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
              ) : comments.length > 0 ? (
                comments.map((c: any, i: number) => (
                  <div key={i} className={`p-3 rounded-lg text-sm ${c.isInternal ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : c.isAdmin ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground text-xs">
                        {c.author?.firstName || 'Support'} {c.isAdmin && '(Support)'}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.createdAt && format(new Date(c.createdAt), 'dd/MM HH:mm', { locale: fr })}</span>
                    </div>
                    <p className="text-foreground">{c.comment || c.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">Aucun message</p>
              )}
            </div>

            {/* Reply */}
            {selectedTicket?.status !== 'closed' && selectedTicket?.status !== 'resolved' && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Votre message..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()} />
                <Button size="icon" onClick={handleSendComment} disabled={sendingComment || newComment.length < 5}>
                  {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
