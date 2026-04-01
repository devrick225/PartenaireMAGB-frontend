import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';

interface AdminUserLite {
  id: string;
  nom: string;
  prenoms: string;
}

export default function AdminNotifications() {
  const { isAdmin, sendNotification } = useAuth();
  const [notifTitre, setNotifTitre] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifDest, setNotifDest] = useState<'tous' | string>('tous');
  const [users, setUsers] = useState<AdminUserLite[]>([]);

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    const loadUsers = async () => {
      const result = await apiRequest<any>('/api/users?limit=200');
      if (!result.ok || !result.data?.success) return;
      const mapped = (result.data.data?.users || []).map((u: any) => ({
        id: u._id,
        nom: u.lastName || '',
        prenoms: u.firstName || '',
      }));
      setUsers(mapped);
    };
    void loadUsers();
  }, []);

  const handleSendNotification = () => {
    if (!notifTitre.trim() || !notifMessage.trim()) {
      toast.error('Veuillez remplir le titre et le message');
      return;
    }
    sendNotification({
      titre: notifTitre,
      message: notifMessage,
      destinataires: notifDest === 'tous' ? 'tous' : [notifDest],
    });
    toast.success('Notification enregistrée (stockage local).');
    setNotifTitre('');
    setNotifMessage('');
    setNotifDest('tous');
  };

  return (
    <AppLayout>
      <div className="container max-w-2xl py-8 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
        </div>
        <p className="text-muted-foreground mb-8">Envoyez des notifications aux utilisateurs</p>

        <Card className="border-border">
          <CardHeader><CardTitle className="font-display text-lg">Envoyer une notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Titre</label>
              <Input placeholder="Titre de la notification" value={notifTitre} onChange={e => setNotifTitre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea placeholder="Contenu du message..." value={notifMessage} onChange={e => setNotifMessage(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Destinataires</label>
              <Select value={notifDest} onValueChange={setNotifDest}>
                <SelectTrigger><SelectValue placeholder="Choisir les destinataires" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les utilisateurs</SelectItem>
                  {users.map(u => (<SelectItem key={u.id} value={u.id}>{u.prenoms} {u.nom}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSendNotification} className="gap-2"><Send className="w-4 h-4" /> Envoyer</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
