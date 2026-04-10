import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileSection, MobileRow, MobileStatCard } from '@/components/mobile/MobileSection';
import { Heart, Wallet, Trophy, TrendingUp, CheckCircle, XCircle, Clock, ExternalLink, ChevronRight, FileText, MessageSquare } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function MobileDashboard() {
  const { user, contributions, payments, getTotalDons, getGamificationLevel, getLiensUtiles } = useAuth();
  const navigate = useNavigate();
  const total = getTotalDons();
  const level = getGamificationLevel();
  const liensUtiles = getLiensUtiles();

  const successPayments = useMemo(() => payments.filter(p => p.statut === 'succes'), [payments]);
  const failedPayments = useMemo(() => payments.filter(p => p.statut === 'echoue'), [payments]);
  const pendingPayments = useMemo(() => payments.filter(p => p.statut === 'en_attente'), [payments]);
  const successRate = payments.length > 0 ? Math.round((successPayments.length / payments.length) * 100) : 0;

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const monthDate = subMonths(now, 4 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const montant = successPayments
        .filter(p => isWithinInterval(new Date(p.date), { start, end }))
        .reduce((sum, p) => sum + (p.devise === 'USD' ? p.montant * 600 : p.montant), 0);
      return { mois: format(monthDate, 'MMM', { locale: fr }), montant };
    });
  }, [successPayments]);

  const recentPayments = useMemo(() =>
    [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [payments]
  );

  const fmt = (m: number) => m >= 1_000_000 ? `${(m / 1_000_000).toFixed(1)}M` : m >= 1000 ? `${(m / 1000).toFixed(0)}k` : String(m);

  const levelColors: Record<string, string> = {
    'Or': 'text-yellow-500', 'Argent': 'text-gray-400', 'Bronze': 'text-amber-600', 'Classique': 'text-primary'
  };

  return (
    <div className="bg-muted/30 min-h-screen pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-4 pt-4 pb-8">
        <p className="text-white/70 text-sm">Bonjour 👋</p>
        <h1 className="text-white font-bold text-2xl mt-0.5">{user?.prenoms}</h1>
        <div className="flex items-center gap-2 mt-3">
          <div className="bg-white/20 rounded-full px-3 py-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-white text-xs font-medium">Niveau {level.level}</span>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1">
            <span className="text-white text-xs">{successRate}% succès</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
            <p className="text-xs text-muted-foreground">Total des dons</p>
            <p className="text-2xl font-bold text-primary mt-1">{fmt(total)}</p>
            <p className="text-xs text-muted-foreground">FCFA</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
            <p className="text-xs text-muted-foreground">Contributions</p>
            <p className="text-2xl font-bold text-foreground mt-1">{contributions.length}</p>
            <p className="text-xs text-muted-foreground">enregistrées</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{successPayments.length}</p>
            <p className="text-[10px] text-green-600/70">Réussis</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{pendingPayments.length}</p>
            <p className="text-[10px] text-orange-600/70">En attente</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{failedPayments.length}</p>
            <p className="text-[10px] text-red-600/70">Échoués</p>
          </div>
        </div>

        {/* Graphique */}
        {monthlyData.some(d => d.montant > 0) && (
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
            <p className="text-sm font-semibold text-foreground mb-3">Évolution (5 mois)</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={monthlyData} barSize={20}>
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString()} FCFA`]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Actions rapides */}
        <MobileSection title="Actions rapides">
          <MobileRow icon={<Heart className="w-4 h-4" />} label="Faire un don" chevron onPress={() => navigate('/donations')} />
          <MobileRow icon={<Wallet className="w-4 h-4" />} label="Mes paiements" chevron onPress={() => navigate('/paiements')} />
          <MobileRow icon={<FileText className="w-4 h-4" />} label="Mes reçus" chevron onPress={() => navigate('/documents')} />
          <MobileRow icon={<MessageSquare className="w-4 h-4" />} label="Support" chevron onPress={() => navigate('/support')} />
        </MobileSection>

        {/* Derniers paiements */}
        {recentPayments.length > 0 && (
          <MobileSection title="Derniers paiements">
            {recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {p.devise === 'USD' ? `$${p.montant.toLocaleString()}` : `${p.montant.toLocaleString()} FCFA`}
                  </p>
                  <p className="text-xs text-muted-foreground">{format(new Date(p.date), 'dd MMM yyyy', { locale: fr })}</p>
                </div>
                <Badge variant={p.statut === 'succes' ? 'default' : p.statut === 'en_attente' ? 'secondary' : 'destructive'} className="text-[10px]">
                  {p.statut === 'succes' ? 'Succès' : p.statut === 'en_attente' ? 'Attente' : 'Échoué'}
                </Badge>
              </div>
            ))}
            <button onClick={() => navigate('/paiements')} className="w-full flex items-center justify-center gap-1 py-3 text-sm text-primary font-medium">
              Voir tout <ChevronRight className="w-4 h-4" />
            </button>
          </MobileSection>
        )}

        {/* Liens utiles */}
        {liensUtiles.length > 0 && (
          <MobileSection title="Liens utiles">
            {liensUtiles.slice(0, 4).map(l => (
              <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <span className="flex-1 text-sm text-foreground truncate">{l.titre}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </MobileSection>
        )}
      </div>
    </div>
  );
}
