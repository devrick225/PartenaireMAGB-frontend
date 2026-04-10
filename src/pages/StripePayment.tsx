import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Formulaire de paiement interne
function CheckoutForm({ amount, currency, donationId, paymentId }: {
  amount: number; currency: string; donationId: string; paymentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const fmt = (m: number, c: string) => c === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/callback?donationId=${donationId}&provider=stripe`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Erreur lors du paiement');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Vérifier côté backend
      await apiRequest(`/api/payments/${paymentId}/verify`, 'POST');
      toast.success('Paiement réussi !');
      navigate(`/callback?donationId=${donationId}&provider=stripe`);
    } else {
      toast.error('Paiement non confirmé');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Montant à payer</span>
          <span className="text-xl font-bold text-foreground">{fmt(amount, currency)}</span>
        </div>
      </div>

      <PaymentElement options={{ layout: 'tabs' }} />

      <Button type="submit" disabled={!stripe || processing} className="w-full gap-2" size="lg">
        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        {processing ? 'Traitement...' : `Payer ${fmt(amount, currency)}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Paiement sécurisé par Stripe
      </p>
    </form>
  );
}

// Page principale
export default function StripePayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const clientSecret = searchParams.get('clientSecret');
  const donationId = searchParams.get('donationId');
  const paymentId = searchParams.get('paymentId');
  const amount = Number(searchParams.get('amount') || 0);
  const currency = searchParams.get('currency') || 'XOF';

  if (!clientSecret || !donationId || !paymentId) {
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

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#59376b',
        borderRadius: '8px',
      },
    },
  };

  return (
    <AppLayout>
      <div className="container max-w-lg py-8 px-4 animate-fade-in">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Paiement par carte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm
                amount={amount}
                currency={currency}
                donationId={donationId}
                paymentId={paymentId}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
