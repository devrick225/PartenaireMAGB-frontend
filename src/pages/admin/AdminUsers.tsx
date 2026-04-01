import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Search, ShieldCheck, ShieldOff, Trash2, Pencil, Mail, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import DataPagination from '@/components/DataPagination';
import PageLoader from '@/components/PageLoader';

interface AdminUser {
  id: string;
  nom: string;
  prenoms: string;
  telephone: string;
  email: string;
  pays: string;
  ville: string;
  role: 'user' | 'support_agent' | 'moderator' | 'treasurer' | 'admin';
  actif: boolean;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export default function AdminUsers() {
  const { user: currentUser, isAdmin } = useAuth();
  const [searchUser, setSearchUser] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ prenoms: '', nom: '', email: '', telephone: '', pays: '', ville: '', isEmailVerified: false, isPhoneVerified: false });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const loadUsers = async () => {
    setLoading(true);
    const result = await apiRequest<any>('/api/users?limit=200');
    if (!result.ok || !result.data?.success) {
      toast.error('Impossible de charger les utilisateurs.');
      setUsers([]);
      setLoading(false);
      return;
    }

    const mapped = (result.data.data?.users || []).map((u: any) => ({
      id: u._id,
      nom: u.lastName || '',
      prenoms: u.firstName || '',
      telephone: u.phone || '',
      email: u.email || '',
      pays: u.country || '',
      ville: u.city || '',
      role: u.role || 'user',
      actif: !!u.isActive,
      profileCompleted: !!u.profile?.isComplete,
      isEmailVerified: !!u.isEmailVerified,
      isPhoneVerified: !!u.isPhoneVerified,
    })) as AdminUser[];

    setUsers(mapped);
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      `${u.nom} ${u.prenoms} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
    );
  }, [users, searchUser]);

  const pagedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * pageSize, page * pageSize),
    [filteredUsers, page, pageSize]
  );

  const handleToggleActive = async (u: AdminUser) => {
    if (u.id === currentUser?.id) return;
    setBusyUserId(u.id);
    const nextStatus = !u.actif;
    const result = await apiRequest<any>(`/api/users/${u.id}/status`, 'PUT', {
      isActive: nextStatus,
      reason: nextStatus ? 'Réactivation par administrateur' : 'Désactivation par administrateur',
    });
    setBusyUserId(null);

    if (!result.ok || !result.data?.success) {
      toast.error(result.data?.error || 'Mise à jour du statut impossible.');
      return;
    }

    setUsers(prev => prev.map(item => item.id === u.id ? { ...item, actif: nextStatus } : item));
    toast.success(nextStatus ? `${u.prenoms} a été activé` : `${u.prenoms} a été désactivé`);
  };

  const openEditDialog = (u: AdminUser) => {
    setEditUser(u);
    setEditForm({
      prenoms: u.prenoms, nom: u.nom, email: u.email, telephone: u.telephone,
      pays: u.pays, ville: u.ville, isEmailVerified: u.isEmailVerified, isPhoneVerified: u.isPhoneVerified,
    });
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const res = await apiRequest<any>(`/api/users/${editUser.id}/admin-update`, 'PUT', {
      firstName: editForm.prenoms, lastName: editForm.nom, email: editForm.email,
      phone: editForm.telephone, country: editForm.pays, city: editForm.ville,
      isEmailVerified: editForm.isEmailVerified, isPhoneVerified: editForm.isPhoneVerified,
    });
    setSaving(false);
    if (res.ok && res.data?.success) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? {
        ...u, prenoms: editForm.prenoms, nom: editForm.nom, email: editForm.email,
        telephone: editForm.telephone, pays: editForm.pays, ville: editForm.ville,
        isEmailVerified: editForm.isEmailVerified, isPhoneVerified: editForm.isPhoneVerified,
      } : u));
      setEditUser(null);
      toast.success('Utilisateur mis à jour');
    } else {
      toast.error(res.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleToggleRole = async (u: AdminUser) => {
    if (u.id === currentUser?.id) return;
    setBusyUserId(u.id);
    const targetRole = u.role === 'admin' ? 'user' : 'admin';
    const result = await apiRequest<any>(`/api/users/${u.id}/role`, 'PUT', { role: targetRole });
    setBusyUserId(null);

    if (!result.ok || !result.data?.success) {
      toast.error(result.data?.error || 'Mise à jour du rôle impossible.');
      return;
    }

    setUsers(prev => prev.map(item => item.id === u.id ? { ...item, role: targetRole } : item));
    toast.success(targetRole === 'admin' ? `${u.prenoms} est maintenant admin` : `${u.prenoms} est maintenant utilisateur`);
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl py-8 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
        </div>
        <p className="text-muted-foreground mb-8">{users.length} utilisateur(s) inscrit(s)</p>

        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="font-display text-lg">Liste des utilisateurs</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={searchUser} onChange={e => { setSearchUser(e.target.value); setPage(1); }} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Vérification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8"><PageLoader message="Chargement des utilisateurs..." /></TableCell></TableRow>
                  ) : pagedUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</TableCell></TableRow>
                  ) : pagedUsers.map(u => (
                    <TableRow key={u.id} className={u.actif === false ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{u.prenoms} {u.nom}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.telephone}</TableCell>
                      <TableCell>{u.pays}</TableCell>
                      <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role === 'admin' ? 'Admin' : 'Utilisateur'}</Badge></TableCell>
                      <TableCell>
                        {u.id !== currentUser?.id ? (
                          <div className="flex items-center gap-2">
                            <Switch checked={u.actif !== false} disabled={busyUserId === u.id} onCheckedChange={() => void handleToggleActive(u)} />
                            <span className="text-xs text-muted-foreground">{u.actif === false ? 'Inactif' : 'Actif'}</span>
                          </div>
                        ) : <Badge variant="default">Actif</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span title="Email" className={u.isEmailVerified ? 'text-green-600' : 'text-muted-foreground'}>
                            <Mail className="w-4 h-4" />
                          </span>
                          <span title="Téléphone" className={u.isPhoneVerified ? 'text-green-600' : 'text-muted-foreground'}>
                            <Phone className="w-4 h-4" />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEditDialog(u)}>
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          {u.id !== currentUser?.id && (
                            <>
                              <Button variant="ghost" size="icon" disabled={busyUserId === u.id} title={u.role === 'admin' ? 'Rétrograder' : 'Promouvoir'} onClick={() => void handleToggleRole(u)}>
                                {u.role === 'admin' ? <ShieldOff className="w-4 h-4 text-muted-foreground" /> : <ShieldCheck className="w-4 h-4 text-primary" />}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" title="Supprimer"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Désactiver cet utilisateur ?</AlertDialogTitle>
                                    <AlertDialogDescription>Le compte de <strong>{u.prenoms} {u.nom}</strong> sera désactivé (sans suppression définitive).</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => void handleToggleActive({ ...u, actif: true })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Désactiver</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DataPagination
              page={page}
              pageSize={pageSize}
              total={filteredUsers.length}
              onPageChange={setPage}
              onPageSizeChange={v => { setPageSize(v); setPage(1); }}
            />
          </CardContent>
        </Card>

      </div>

      {/* Edit user dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Modifier l'utilisateur</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Prénom</Label><Input value={editForm.prenoms} onChange={e => setEditForm(f => ({ ...f, prenoms: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Nom</Label><Input value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} /></div>
              </div>
              <div className="space-y-1"><Label>Email</Label><Input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Téléphone</Label><Input value={editForm.telephone} onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Pays</Label><Input value={editForm.pays} onChange={e => setEditForm(f => ({ ...f, pays: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Ville</Label><Input value={editForm.ville} onChange={e => setEditForm(f => ({ ...f, ville: e.target.value }))} /></div>
              </div>
              <div className="border-t border-border pt-3 space-y-3">
                <p className="text-sm font-medium text-foreground">Vérification du compte</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Email vérifié</span></div>
                  <Switch checked={editForm.isEmailVerified} onCheckedChange={v => setEditForm(f => ({ ...f, isEmailVerified: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Téléphone vérifié</span></div>
                  <Switch checked={editForm.isPhoneVerified} onCheckedChange={v => setEditForm(f => ({ ...f, isPhoneVerified: v }))} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Annuler</Button>
            <Button onClick={handleSaveUser} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
