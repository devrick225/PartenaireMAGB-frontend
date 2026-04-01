import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(email, password)) {
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } else {
      toast.error('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-display font-bold text-3xl">M</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Partenaire <span className="text-secondary">MAGB</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ministère d'Adoration Geneviève Brou
          </p>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">Connexion</CardTitle>
            <CardDescription>Accédez à votre espace partenaire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
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
              <div className="flex items-center justify-between">
                <Link to="/reset-password" className="text-xs text-secondary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Se connecter
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="font-semibold text-secondary hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
