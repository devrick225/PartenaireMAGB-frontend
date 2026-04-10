import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Home, Heart, Wallet, FileText, User, Bell, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/donations', icon: Heart, label: 'Dons' },
  { to: '/paiements', icon: Wallet, label: 'Paiements' },
  { to: '/support', icon: MessageSquare, label: 'Support' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export default function MobileLayout({ children }: { children: ReactNode }) {
  const { user, getUserNotifications, markNotificationRead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userNotifs = getUserNotifications();
  const unreadCount = userNotifs.filter(n => !n.lue.includes(user?.id || '')).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar mobile */}
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-4 safe-area-top">
        <div className="flex items-center gap-2">
          <img src="/favicon-32x32.png" alt="MAGB" className="w-7 h-7 rounded-full object-contain" />
          <span className="font-bold text-sm text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Partenaire MAGB
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="px-4 py-3 border-b border-border">
              <h4 className="font-semibold text-sm">Notifications</h4>
              <p className="text-xs text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            </div>
            <ScrollArea className="max-h-72">
              {userNotifs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucune notification</p>
              ) : (
                <div className="divide-y divide-border">
                  {userNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(n => {
                    const isRead = n.lue.includes(user?.id || '');
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm cursor-pointer hover:bg-muted ${!isRead ? 'bg-primary/5' : ''}`}
                        onClick={() => !isRead && markNotificationRead(n.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium ${!isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.titre}</p>
                          {!isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        </div>
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-muted-foreground/60 text-[10px] mt-1">
                          {format(new Date(n.date), 'dd MMM à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </header>

      {/* Content — padding bottom pour la bottom nav */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>{label}</span>
                {isActive && <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
