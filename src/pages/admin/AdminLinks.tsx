import { useState } from 'react';
import { useAuth, LienUtile } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Link2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

export default function AdminLinks() {
  const { isAdmin, getLiensUtiles, addLienUtile, updateLienUtile, deleteLienUtile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lienDialogOpen, setLienDialogOpen] = useState(false);
  const [editingLien, setEditingLien] = useState<LienUtile | null>(null);
  const [lienTitre, setLienTitre] = useState('');
  const [lienUrl, setLienUrl] = useState('');
  const [lienDescription, setLienDescription] = useState('');

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const liensUtiles = getLiensUtiles();

  const openLienDialog = (lien?: LienUtile) => {
    if (lien) {
      setEditingLien(lien);
      setLienTitre(lien.titre);
      setLienUrl(lien.url);
      setLienDescription(lien.description);
    } else {
      setEditingLien(null);
      setLienTitre('');
      setLienUrl('');
      setLienDescription('');
    }
    setLienDialogOpen(true);
  };

  const handleSaveLien = () => {
    if (!lienTitre.trim() || !lienUrl.trim()) {
      toast.error("Veuillez remplir le titre et l'URL");
      return;
    }
    if (editingLien) {
      updateLienUtile(editingLien.id, { titre: lienTitre, url: lienUrl, description: lienDescription });
      toast.success('Lien modifié avec succès');
    } else {
      addLienUtile({ titre: lienTitre, url: lienUrl, description: lienDescription });
      toast.success('Lien ajouté avec succès');
    }
    setLienDialogOpen(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl py-8 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Link2 className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Liens utiles</h1>
        </div>
        <p className="text-muted-foreground mb-8">Gérez les ressources partagées avec les partenaires</p>

        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="font-display text-lg">Liens utiles</CardTitle>
              <Button onClick={() => openLienDialog()} className="gap-2"><Plus className="w-4 h-4" /> Ajouter un lien</Button>
            </div>
          </CardHeader>
          <CardContent>
            {liensUtiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Link2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Aucun lien utile pour le moment</p>
                <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => openLienDialog()}>
                  <Plus className="w-4 h-4" /> Ajouter le premier lien
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {liensUtiles.map(l => (
                  <div key={l.id} className="flex items-start justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary truncate">{l.titre}</a>
                      </div>
                      {l.description && <p className="text-sm text-muted-foreground mt-1 ml-6">{l.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1 ml-6 truncate">{l.url}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button variant="ghost" size="icon" onClick={() => openLienDialog(l)}><Pencil className="w-4 h-4 text-muted-foreground" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce lien ?</AlertDialogTitle>
                            <AlertDialogDescription>Le lien « {l.titre} » sera supprimé définitivement.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { deleteLienUtile(l.id); setRefreshKey(k => k + 1); toast.success('Lien supprimé'); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={lienDialogOpen} onOpenChange={setLienDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editingLien ? 'Modifier le lien' : 'Ajouter un lien utile'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Titre *</label>
                <Input placeholder="Ex: Site officiel" value={lienTitre} onChange={e => setLienTitre(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL *</label>
                <Input placeholder="https://..." value={lienUrl} onChange={e => setLienUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea placeholder="Description du lien..." value={lienDescription} onChange={e => setLienDescription(e.target.value)} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLienDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSaveLien}>{editingLien ? 'Enregistrer' : 'Ajouter'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
