import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2, ArrowLeft, RefreshCw, Receipt } from 'lucide-react';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPaymentStatus, refreshFinancialData } = useAuth();

  const status = searchParams.get('status') || 'pending';
  const donationId = searchParams.get('donationId');
  const paymentId = searchParams.get('paymentId');
  const transactionId = searchParams.get('transactionId');
  const error = searchParams.get('error');

  const [verifying, setVerifying] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);

  useEffect(() => {
    // Rafraîchir les données financières au retour du paiement
    void refreshFinancialData();
  }, [refreshFinancialData]);

  const handleVerify = async () => {
    if (!paymentId) return;
    setVerifying(true);
    const result = await verifyPaymentStatus(paymentId);
    if (result.success && result.status) {
      setVerifiedStatus(result.status);
      await refreshFinancialData();
    }
    setVerifying(false);
  };

  const currentStatus = verifiedStatus || status;

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
      title: 'Paiement réussi !',
      description: 'Votre don a été confirmé avec succès. Merci pour votre générosité.',
      badge: <Badge className="bg-green-100 text-green-700 border-green-200">Confirmé</Badge>,
    },
    failed: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/30',
      title: 'Paiement échoué',
      description: error
        ? `Le paiement n'a pas abouti: ${error}`
        : 'Le paiement n\'a pas pu être traité. Vous pouvez réessayer.',
      badge: <Badge variant="destructive">Échoué</Badge>,
    },
    cancelled: {
      icon: XCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      title: 'Paiement annulé',
      description: 'Le paiement a été annulé. Aucun montant n\'a été débité.',
      badge: <Badge className="bg-orange-100 text-orange-700 border-orange-200">Annulé</Badge>,
    },
    pending: {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      title: 'Paiement en cours de traitement',
      description: 'Votre paiement est en cours de vérification. Cela peut prendre quelques instants.',
      badge: <Badge variant="outline">En attente</Badge>,
    },
  };

  const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <AppLayout>
      <div className="container max-w-lg py-16 px-4 animate-fade-in">
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            {/* Status header */}
            <div className={`${config.bg} p-8 text-center`}>
              <div className={`w-20 h-20 mx-auto rounded-full bg-white/80 dark:bg-black/20 flex items-center justify-center mb-4`}>
                <Icon className={`w-10 h-10 ${config.color}`} />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{config.title}</h1>
              <p className="text-muted-foreground text-sm">{config.description}</p>
              <div className="mt-3">{config.badge}</div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              {transactionId && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Transaction</span>
                  <span className="text-sm font-mono font-medium text-foreground">{transactionId}</span>
                </div>
              )}
              {donationId && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Don</span>
                  <span className="text-sm font-mono font-medium text-foreground">{donationId.slice(-8)}</span>
                </div>
              )}
              {paymentId && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Paiement</span>
                  <span className="text-sm font-mono font-medium text-foreground">{paymentId.slice(-8)}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                {currentStatus === 'pending' && paymentId && (
                  <Button onClick={handleVerify} disabled={verifying} className="w-full gap-2">
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {verifying ? 'Vérification...' : 'Vérifier le statut'}
                  </Button>
                )}

                {currentStatus === 'completed' && (
                  <Button onClick={() => navigate('/paiements')} className="w-full gap-2">
                    <Receipt className="w-4 h-4" />
                    Voir mes paiements
                  </Button>
                )}

                {(currentStatus === 'failed' || currentStatus === 'cancelled') && (
                  <Button onClick={() => navigate('/donations')} className="w-full gap-2">
                    Réessayer un don
                  </Button>
                )}

                <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Retour au tableau de bord
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
