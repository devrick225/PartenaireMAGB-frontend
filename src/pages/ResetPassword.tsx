import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function ResetPassword() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await apiRequest<any>('/api/auth/request-password-reset-code', 'POST', { email });
    setSubmitting(false);

    if (!result.ok || !result.data?.success) {
      toast.error(result.data?.error || 'Impossible d\'envoyer le code de réinitialisation');
      return;
    }

    setStep('reset');
    toast.success('Code envoyé par email. Entrez le code reçu.');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error('Le code doit contenir 6 chiffres');
      return;
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSubmitting(true);
    const result = await apiRequest<any>('/api/auth/reset-password-with-code', 'POST', {
      email,
      code,
      newPassword: password,
    });
    setSubmitting(false);

    if (!result.ok || !result.data?.success) {
      toast.error(result.data?.error || 'Réinitialisation impossible');
      return;
    }

    toast.success('Mot de passe réinitialisé avec succès !');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-display font-bold text-3xl">M</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Partenaire <span className="text-secondary">MAGB</span>
          </h1>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">
              {step === 'email' ? 'Mot de passe oublié' : 'Nouveau mot de passe'}
            </CardTitle>
            <CardDescription>
              {step === 'email'
                ? 'Entrez votre adresse email pour réinitialiser votre mot de passe'
                : 'Définissez votre nouveau mot de passe'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {submitting ? 'Envoi...' : 'Continuer'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code reçu par email</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {submitting ? 'Réinitialisation...' : 'Réinitialiser'}
                </Button>
              </form>
            )}
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-secondary hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
