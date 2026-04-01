import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowRight } from 'lucide-react';

export default function Welcome() {
  const { user, completeFirstLogin } = useAuth();
  const navigate = useNavigate();

  const handleContinue = () => {
    completeFirstLogin();
    navigate('/profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full shadow-xl border-border animate-fade-in">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center">
            <Heart className="w-12 h-12 text-secondary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Bienvenue, {user?.prenoms} ! 🙏
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Nous sommes ravis de vous accueillir dans la communauté du{' '}
            <strong className="text-foreground">Ministère d'Adoration Geneviève Brou</strong>.
          </p>
          <p className="text-muted-foreground">
            Votre partenariat est précieux et contribue à l'avancement de l'œuvre de Dieu.
            Ensemble, nous pouvons faire la différence.
          </p>
          <div className="bg-purple-light rounded-xl p-4 text-sm text-foreground">
            <p className="font-semibold mb-1">Prochaine étape :</p>
            <p className="text-muted-foreground">Complétez votre profil pour personnaliser votre expérience.</p>
          </div>
          <Button onClick={handleContinue} className="w-full gap-2" size="lg">
            Compléter mon profil <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
