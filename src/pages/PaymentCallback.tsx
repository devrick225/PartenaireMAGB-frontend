import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2, ArrowLeft, RefreshCw, Receipt } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshFinancialData } = useAuth();

  // MoneyFusion envoie: donationId + token (parfois token apparaît 2x dans l'URL)
  const donationId = searchParams.get('donationId');
  const tokens = searchParams.getAll('token');
  const mfToken = tokens[tokens.length - 1] || null; // dernier token = vrai token MF

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState('XOF');
  const [attempts, setAttempts] = useState(0);

  const checkPayment = useCallback(async () => {
    if (!donationId) {
      setPaymentStatus('failed');
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest<any>(`/api/payments/donation/${donationId}`);

      if (res.ok && res.data?.success && res.data?.data?.payment) {
        const p = res.data.data.payment;
        setPaymentId(p._id);
        setAmount(p.amount);
        setCurrency(p.currency || 'XOF');

        if (p.status === 'completed') {
          setPaymentStatus('completed');
          await refreshFinancialData();
        } else if (['failed', 'cancelled', 'expired'].includes(p.status)) {
          setPaymentStatus('failed');
        } else {
          setPaymentStatus('pending');
        }
      } else {
        setPaymentStatus('pending');
      }
    } catch {
      setPaymentStatus('pending');
    } finally {
      setLoading(false);
    }
  }, [donationId, refreshFinancialData]);

  useEffect(() => { void checkPayment(); }, [checkPayment]);

  // Auto-retry si pending (webhook peut arriver avec délai)
  useEffect(() => {
    if (paymentStatus !== 'pending' || loading || attempts >= 6) return;
    const timer = setTimeout(async () => {
      setAttempts(a => a + 1);
      await checkPayment();
    }, 4000);
    return () => clearTimeout(timer);
  }, [paymentStatus, loading, attempts, checkPayment]);

  const handleVerify = async () => {
    setVerifying(true);
    setAttempts(0);
    if (paymentId) {
      await apiRequest(`/api/payments/${paymentId}/verify`, 'POST');
    }
    await checkPayment();
    setVerifying(false);
  };

  const fmt = (m: number, c: string) => c === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  if (loading) {
    return (
      <AppLayout>
        <div className="container max-w-lg py-16 px-4 text-center animate-fade-in">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Vérification du paiement...</p>
        </div>
      </AppLayout>
    );
  }

  const configs = {
    completed: {
      icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20',
      title: 'Paiement confirmé !', desc: 'Votre don a été traité avec succès. Merci 🙏',
      badge: <Badge className="bg-green-100 text-green-700 border-green-200">Confirmé</Badge>,
    },
    failed: {
      icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20',
      title: 'Paiement échoué', desc: "Le paiement n'a pas abouti. Vous pouvez réessayer.",
      badge: <Badge variant="destructive">Échoué</Badge>,
    },
    pending: {
      icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
      title: 'Vérification en cours…', desc: `Traitement en cours. Vérification automatique (${attempts}/6)`,
      badge: <Badge variant="outline">En attente</Badge>,
    },
  };

  const c = configs[paymentStatus];
  const Icon = c.icon;

  return (
    <AppLayout>
      <div className="container max-w-lg py-16 px-4 animate-fade-in">
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            <div className={`${c.bg} p-8 text-center`}>
              <div className="w-20 h-20 mx-auto rounded-full bg-white/80 dark:bg-black/20 flex items-center justify-center mb-4">
                {paymentStatus === 'pending'
                  ? <Loader2 className={`w-10 h-10 ${c.color} animate-spin`} />
                  : <Icon className={`w-10 h-10 ${c.color}`} />
                }
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{c.title}</h1>
              <p className="text-muted-foreground text-sm">{c.desc}</p>
              <div className="mt-3">{c.badge}</div>
            </div>

            <div className="p-6 space-y-3">
              {amount != null && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="text-sm font-bold text-foreground">{fmt(amount, currency)}</span>
                </div>
              )}
              {donationId && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Référence</span>
                  <span className="text-sm font-mono text-foreground">{donationId.slice(-8)}</span>
                </div>
              )}
              {mfToken && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Token MF</span>
                  <span className="text-sm font-mono text-foreground">{mfToken.slice(-8)}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                {paymentStatus === 'pending' && (
                  <Button onClick={handleVerify} disabled={verifying} className="w-full gap-2">
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {verifying ? 'Vérification...' : 'Vérifier maintenant'}
                  </Button>
                )}
                {paymentStatus === 'completed' && (
                  <Button onClick={() => navigate('/paiements')} className="w-full gap-2">
                    <Receipt className="w-4 h-4" /> Voir mes paiements
                  </Button>
                )}
                {paymentStatus === 'failed' && (
                  <Button onClick={() => navigate('/donations')} className="w-full gap-2">
                    Réessayer un don
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
