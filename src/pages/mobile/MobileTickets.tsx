import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileSection } from '@/components/mobile/MobileSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Send, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'technical', label: 'Technique' }, { value: 'payment', label: 'Paiement' },
  { value: 'account', label: 'Compte' }, { value: 'donation', label: 'Don' },
  { value: 'general', label: 'Général' }, { value: 'suggestion', label: 'Suggestion' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'En cours', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  waiting_user: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Fermé', color: 'bg-muted text-muted-foreground' },
};

export default function MobileTickets() {
  const { isDataLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [selected, setSelected] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    const res = await apiRequest<any>('/api/tickets?limit=100');
    if (res.ok && res.data?.success) setTickets(res.data.data?.tickets || []);
    setLoading(false);
  };

  useEffect(() => { void loadTickets(); }, []);

  const sorted = useMemo(() =>
    [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [tickets]);

  const handleCreate = async () => {
    if (subject.length < 5 || description.length < 10) { toast.error('Sujet et description requis'); return; }
    setCreating(true);
    const res = await apiRequest<any>('/api/tickets', 'POST', { subject, description, category });
    setCreating(false);
    if (res.ok && res.data?.success) {
      toast.success('Ticket créé'); setShowCreate(false);
      setSubject(''); setDescription(''); setCategory('general');
      void loadTickets();
    } else toast.error('Erreur');
  };

  const openTicket = async (ticket: any) => {
    setSelected(ticket); setLoadingComments(true);
    const res = await apiRequest<any>(`/api/tickets/${ticket._id}/comments`);
    if (res.ok && res.data?.success) setComments(res.data.data?.comments || []);
    else setComments([]);
    setLoadingComments(false);
  };

  const handleSend = async () => {
    if (!selected || newComment.length < 5) return;
    setSending(true);
    await apiRequest(`/api/tickets/${selected._id}/comments`, 'POST', { comment: newComment });
    setSending(false); setNewComment('');
    const r = await apiRequest<any>(`/api/tickets/${selected._id}/comments`);
    if (r.ok && r.data?.success) setComments(r.data.data?.comments || []);
    toast.success('Message envoyé');
  };

  return (
    <div className="bg-muted/30 min-h-screen pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-4 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-white/80" />
              <p className="text-white/80 text-sm">Support</p>
            </div>
            <p className="text-white font-bold text-xl">{tickets.length} ticket{tickets.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun ticket</p>
            <Button size="sm" className="mt-4 rounded-xl" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-1" /> Créer un ticket
            </Button>
          </div>
        ) : (
          <MobileSection>
            {sorted.map(t => {
              const s = STATUS_MAP[t.status] || STATUS_MAP.open;
              return (
                <button key={t._id} onClick={() => openTicket(t)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 hover:bg-muted/50 text-left">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(t.createdAt), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 ${s.color}`}>{s.label}</span>
                </button>
              );
            })}
          </MobileSection>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Nouveau ticket</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Sujet</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Résumé du problème" className="rounded-xl" />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre problème..." rows={3} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button className="flex-1 rounded-xl" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket detail */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-base truncate">{selected?.subject}</DialogTitle>
            {selected && <span className={`text-[10px] font-medium px-2 py-1 rounded-full w-fit ${(STATUS_MAP[selected.status] || STATUS_MAP.open).color}`}>
              {(STATUS_MAP[selected.status] || STATUS_MAP.open).label}
            </span>}
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            <div className="bg-muted/50 rounded-xl p-3 text-sm text-foreground">{selected?.description}</div>
            {loadingComments ? <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
              : comments.map((c: any, i: number) => (
                <div key={i} className={`p-3 rounded-xl text-sm ${c.isAdmin ? 'bg-primary/5 border border-primary/20 ml-4' : 'bg-muted/30 mr-4'}`}>
                  <p className="text-[10px] text-muted-foreground mb-1">{c.author?.firstName || 'Support'} · {c.createdAt && format(new Date(c.createdAt), 'dd/MM HH:mm', { locale: fr })}</p>
                  <p className="text-foreground">{c.comment || c.content}</p>
                </div>
              ))}
          </div>
          {selected?.status !== 'closed' && selected?.status !== 'resolved' && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Votre message..." className="rounded-xl flex-1"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
              <Button size="icon" className="rounded-xl shrink-0" onClick={handleSend} disabled={sending || newComment.length < 5}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
