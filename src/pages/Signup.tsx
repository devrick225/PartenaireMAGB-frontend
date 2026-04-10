import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Pays avec code ISO 2 lettres + indicatif téléphonique
const COUNTRIES = [
  { name: "Côte d'Ivoire", iso: 'CI', dial: '+225', flag: '🇨🇮' },
  { name: 'France', iso: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Cameroun', iso: 'CM', dial: '+237', flag: '🇨🇲' },
  { name: 'Sénégal', iso: 'SN', dial: '+221', flag: '🇸🇳' },
  { name: 'Burkina Faso', iso: 'BF', dial: '+226', flag: '🇧🇫' },
  { name: 'Mali', iso: 'ML', dial: '+223', flag: '🇲🇱' },
  { name: 'Gabon', iso: 'GA', dial: '+241', flag: '🇬🇦' },
  { name: 'Congo', iso: 'CG', dial: '+242', flag: '🇨🇬' },
  { name: 'RDC', iso: 'CD', dial: '+243', flag: '🇨🇩' },
  { name: 'Togo', iso: 'TG', dial: '+228', flag: '🇹🇬' },
  { name: 'Bénin', iso: 'BJ', dial: '+229', flag: '🇧🇯' },
  { name: 'Guinée', iso: 'GN', dial: '+224', flag: '🇬🇳' },
  { name: 'Niger', iso: 'NE', dial: '+227', flag: '🇳🇪' },
  { name: 'Canada', iso: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'États-Unis', iso: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Belgique', iso: 'BE', dial: '+32', flag: '🇧🇪' },
  { name: 'Suisse', iso: 'CH', dial: '+41', flag: '🇨🇭' },
  { name: 'Royaume-Uni', iso: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'Allemagne', iso: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'Autre', iso: 'XX', dial: '+', flag: '🌍' },
];

export default function Signup() {
  const [form, setForm] = useState({
    nom: '', prenoms: '', phoneLocal: '', email: '',
    countryIso: 'CI', dateNaissance: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const selectedCountry = useMemo(() =>
    COUNTRIES.find(c => c.iso === form.countryIso) || COUNTRIES[0],
    [form.countryIso]
  );

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  // Construire le numéro complet avec indicatif
  const buildFullPhone = () => {
    const local = form.phoneLocal.replace(/\D/g, ''); // chiffres seulement
    if (!local) return '';
    // Supprimer le 0 initial si présent
    const withoutLeadingZero = local.startsWith('0') ? local.substring(1) : local;
    return `${selectedCountry.dial}${withoutLeadingZero}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!form.phoneLocal) {
      toast.error('Veuillez saisir votre numéro de téléphone');
      return;
    }

    const fullPhone = buildFullPhone();

    setLoading(true);
    const success = await signup({
      nom: form.nom,
      prenoms: form.prenoms,
      telephone: fullPhone,
      email: form.email,
      pays: form.countryIso,
      dateNaissance: form.dateNaissance,
      password: form.password,
    });
    setLoading(false);

    if (success) {
      toast.success('Inscription réussie ! Bienvenue 🎉');
      navigate('/dashboard');
    } else {
      toast.error('Erreur lors de l\'inscription. Vérifiez vos informations.');
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
                  <Label htmlFor="prenoms">Prénoms *</Label>
                  <Input id="prenoms" value={form.prenoms} onChange={e => update('prenoms', e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>

              {/* Pays */}
              <div className="space-y-2">
                <Label>Pays *</Label>
                <Select value={form.countryIso} onValueChange={v => update('countryIso', v)}>
                  <SelectTrigger>
                    <SelectValue>
                      {selectedCountry.flag} {selectedCountry.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.iso} value={c.iso}>
                        {c.flag} {c.name} ({c.dial})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Téléphone avec indicatif */}
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-input bg-muted text-sm font-medium shrink-0 min-w-[80px]">
                    <span>{selectedCountry.flag}</span>
                    <span className="text-muted-foreground">{selectedCountry.dial}</span>
                  </div>
                  <Input
                    id="telephone"
                    type="tel"
                    placeholder="07 79 03 80 69"
                    value={form.phoneLocal}
                    onChange={e => update('phoneLocal', e.target.value)}
                    className="flex-1"
                    required
                  />
                </div>
                {form.phoneLocal && (
                  <p className="text-xs text-muted-foreground">
                    Numéro complet: <span className="font-mono font-medium text-foreground">{buildFullPhone()}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance</Label>
                <Input id="dateNaissance" type="date" value={form.dateNaissance} onChange={e => update('dateNaissance', e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
                  <p className="text-xs text-muted-foreground">8 car. min, 1 maj, 1 chiffre</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer *</Label>
                  <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Inscription...' : "S'inscrire"}
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
