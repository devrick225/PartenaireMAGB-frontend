import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import PageLoader, { CardSkeleton } from '@/components/PageLoader';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileDashboard from '@/pages/mobile/MobileDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Heart, Calendar, Trophy, TrendingUp, ExternalLink, Link2, CheckCircle, XCircle, Clock, Wallet, Target, Flame } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from 'recharts';

export default function Dashboard() {
  const { user, contributions, payments, getTotalDons, getGamificationLevel, getLiensUtiles, isDataLoading } = useAuth();
  const isMobile = useIsMobile();

  const liensUtiles = getLiensUtiles();
  const total = getTotalDons();
  const level = getGamificationLevel();

  const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  };


  // === Derived stats ===
  const successPayments = useMemo(() => payments.filter(p => p.statut === 'succes'), [payments]);
  const failedPayments = useMemo(() => payments.filter(p => p.statut === 'echoue'), [payments]);
  const pendingPayments = useMemo(() => payments.filter(p => p.statut === 'en_attente'), [payments]);

  const successRate = payments.length > 0 ? Math.round((successPayments.length / payments.length) * 100) : 0;

  const averageDonation = useMemo(() => {
    if (successPayments.length === 0) return 0;
    return Math.round(successPayments.reduce((sum, p) => sum + (p.devise === 'USD' ? p.montant * 600 : p.montant), 0) / successPayments.length);
  }, [successPayments]);

  const biggestDonation = useMemo(() => {
    if (successPayments.length === 0) return 0;
    return Math.max(...successPayments.map(p => p.devise === 'USD' ? p.montant * 600 : p.montant));
  }, [successPayments]);

  // Streak: consecutive months with at least one successful payment
  const donationStreak = useMemo(() => {
    if (successPayments.length === 0) return 0;
    const now = new Date();
    let streak = 0;
    for (let i = 0; i < 24; i++) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const hasPayment = successPayments.some(p => isWithinInterval(new Date(p.date), { start, end }));
      if (hasPayment) streak++;
      else if (i > 0) break; // allow current month to be empty
    }
    return streak;
  }, [successPayments]);

  // === Charts data ===
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const monthPayments = successPayments.filter(
        p => isWithinInterval(new Date(p.date), { start, end })
      );
      const montant = monthPayments.reduce((sum, p) => sum + (p.devise === 'USD' ? p.montant * 600 : p.montant), 0);
      return { mois: format(monthDate, 'MMM yy', { locale: fr }), montant };
    });
  }, [successPayments]);

  // Cumulative total over time
  const cumulativeData = useMemo(() => {
    const now = new Date();
    let cumul = 0;
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = subMonths(now, 11 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const monthTotal = successPayments
        .filter(p => isWithinInterval(new Date(p.date), { start, end }))
        .reduce((sum, p) => sum + (p.devise === 'USD' ? p.montant * 600 : p.montant), 0);
      cumul += monthTotal;
      return { mois: format(monthDate, 'MMM yy', { locale: fr }), total: cumul };
    });
  }, [successPayments]);

  const typeData = useMemo(() => {
    const ponctuel = contributions.filter(c => c.type === 'ponctuelle').length;
    const recurrent = contributions.filter(c => c.type === 'recurrente').length;
    return [
      { name: 'Ponctuel', value: ponctuel },
      { name: 'Récurrent', value: recurrent },
    ].filter(d => d.value > 0);
  }, [contributions]);

  const statusData = useMemo(() => {
    return [
      { name: 'Succès', value: successPayments.length, color: 'hsl(var(--secondary))' },
      { name: 'En attente', value: pendingPayments.length, color: 'hsl(var(--muted-foreground))' },
      { name: 'Échoué', value: failedPayments.length, color: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  }, [successPayments, pendingPayments, failedPayments]);

  const upcomingEngagements = contributions
    .flatMap(c => c.datesEngagement.map(d => ({ date: d, montant: c.montant, devise: c.devise, type: c.type })))
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const formatMontant = (m: number, d: string) =>
    d === 'USD' ? `$${m.toLocaleString()}` : `${m.toLocaleString()} FCFA`;

  if (isDataLoading) {
    return (
      <AppLayout>
        <div className="container py-8 px-4 space-y-8">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <CardSkeleton count={4} />
          <CardSkeleton count={4} />
        </div>
      </AppLayout>
    );
  }

  if (isMobile) return <AppLayout><MobileDashboard /></AppLayout>;

  return (
    <AppLayout>
      <div className="container py-8 px-4 space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Bonjour, {user?.prenoms} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Voici un résumé de votre activité</p>
        </div>

        {/* Stats cards - row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total des dons</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{total.toLocaleString()} FCFA</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Don moyen</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{averageDonation.toLocaleString()} FCFA</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plus gros don</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{biggestDonation.toLocaleString()} FCFA</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Série active</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{donationStreak} mois</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats cards - row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <p className={`text-2xl font-bold mt-1 ${level.color}`}>{level.level}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contributions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{contributions.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de succès</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-foreground">{successRate}%</p>
                    <span className="text-xs text-muted-foreground">({successPayments.length}/{payments.length})</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <Progress value={successRate} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paiements</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{payments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="flex gap-2 mt-3 text-xs">
                <span className="flex items-center gap-1 text-secondary"><CheckCircle className="w-3 h-3" />{successPayments.length}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />{pendingPayments.length}</span>
                <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3 h-3" />{failedPayments.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamification progress */}
        <Card className="border-border overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" /> Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { name: 'Classique', min: 0, color: 'bg-muted' },
                { name: 'Bronze', min: 300_001, color: 'bg-gold-dark' },
                { name: 'Argent', min: 1_000_001, color: 'bg-muted-foreground' },
                { name: 'Or', min: 10_000_000, color: 'bg-secondary' },
              ].map(l => (
                <div key={l.name} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  level.level === l.name ? `${l.color} text-card font-bold` : 'text-muted-foreground'
                }`}>
                  {level.level === l.name && '✓ '}{l.name}
                </div>
              ))}
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-3">
              <div
                className="bg-secondary h-3 rounded-full transition-all"
                style={{ width: `${Math.min((total / 10_000_000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {level.max ? `${formatMontant(level.max - total, 'FCFA')} restants pour atteindre le niveau suivant` : 'Niveau maximum atteint ! 🌟'}
            </p>
          </CardContent>
        </Card>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" /> Évolution mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.some(d => d.montant > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mois" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                  Aucun don sur les 6 derniers mois
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cumulative area chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" /> Total cumulé (12 mois)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cumulativeData.some(d => d.total > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={cumulativeData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mois" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Total cumulé']}
                      contentStyle={tooltipStyle}
                    />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" /> Répartition par type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                  Aucune contribution enregistrée
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment status distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" /> Statut des paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                  Aucun paiement effectué
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming engagements */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">Prochaines échéances</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEngagements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Aucune échéance à venir</p>
                  <Link to="/donations">
                    <Button variant="outline" size="sm" className="mt-3">Faire un don</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEngagements.map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground">
                          {format(new Date(e.date), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{e.type}</p>
                      </div>
                      <span className="font-semibold text-foreground">{formatMontant(e.montant, e.devise)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent payments */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">Derniers paiements</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Aucun paiement effectué</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{format(new Date(p.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{formatMontant(p.montant, p.devise)}</TableCell>
                        <TableCell>
                          <Badge variant={p.statut === 'succes' ? 'default' : p.statut === 'en_attente' ? 'secondary' : 'destructive'}>
                            {p.statut === 'succes' ? 'Succès' : p.statut === 'en_attente' ? 'En attente' : 'Échoué'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liens utiles */}
        {liensUtiles.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" /> Liens utiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {liensUtiles.map(l => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">{l.titre}</p>
                      {l.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{l.description}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
