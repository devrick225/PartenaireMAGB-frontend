import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PayPalPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const approvalUrl = searchParams.get('approvalUrl');
  const donationId = searchParams.get('donationId');

  useEffect(() => {
    // Rediriger immédiatement vers PayPal
    if (approvalUrl) {
      window.location.href = approvalUrl;
    }
  }, [approvalUrl]);

  if (!approvalUrl || !donationId) {
    return (
      <AppLayout>
        <div className="container max-w-lg py-16 px-4 text-center">
          <p className="text-muted-foreground">Paramètres de paiement manquants.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/donations')}>
            Retour aux dons
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-lg py-16 px-4 text-center animate-fade-in">
        <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
        <p className="text-foreground font-medium">Redirection vers PayPal...</p>
        <p className="text-muted-foreground text-sm mt-2">Vous allez être redirigé vers la page de paiement PayPal.</p>
        <Button variant="ghost" className="mt-6 gap-2" onClick={() => navigate('/donations')}>
          <ArrowLeft className="w-4 h-4" /> Annuler
        </Button>
      </div>
    </AppLayout>
  );
}
