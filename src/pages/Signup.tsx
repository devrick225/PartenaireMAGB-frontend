import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const PAYS = [
  "Côte d'Ivoire", "France", "Cameroun", "Sénégal", "Burkina Faso", "Mali",
  "Gabon", "Congo", "RDC", "Togo", "Bénin", "Guinée", "Canada", "États-Unis",
  "Belgique", "Suisse", "Royaume-Uni", "Allemagne", "Autre"
];

export default function Signup() {
  const [form, setForm] = useState({
    nom: '', prenoms: '', telephone: '', email: '', pays: '', dateNaissance: '', password: '', confirmPassword: ''
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    const { confirmPassword, ...userData } = form;
    if (await signup(userData)) {
      toast.success('Inscription réussie ! Bienvenue 🎉');
      navigate('/dashboard');
    } else {
      toast.error('Un compte avec cet email existe déjà');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
            <span className="text-primary-foreground font-display font-bold text-2xl">M</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Rejoindre <span className="text-secondary">MAGB</span>
          </h1>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader>
            <CardTitle className="font-display text-xl">Inscription</CardTitle>
            <CardDescription>Créez votre compte partenaire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" value={form.nom} onChange={e => update('nom', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenoms">Prénoms / Raison sociale *</Label>
                  <Input id="prenoms" value={form.prenoms} onChange={e => update('prenoms', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input id="telephone" type="tel" value={form.telephone} onChange={e => update('telephone', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Pays *</Label>
                <Select value={form.pays} onValueChange={v => update('pays', v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez votre pays" /></SelectTrigger>
                  <SelectContent>
                    {PAYS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance *</Label>
                <Input id="dateNaissance" type="date" value={form.dateNaissance} onChange={e => update('dateNaissance', e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer *</Label>
                  <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full">
                S'inscrire
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-semibold text-secondary hover:underline">Se connecter</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
