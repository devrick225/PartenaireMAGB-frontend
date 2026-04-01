import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, profile, getUserNotifications, markNotificationRead } = useAuth();
  const navigate = useNavigate();

  const userNotifs = getUserNotifications();
  const unreadCount = userNotifs.filter(n => !n.lue.includes(user?.id || '')).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-12 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4">
            <SidebarTrigger className="-ml-1" />

            <div className="flex items-center gap-1">
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
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
                              className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-muted ${!isRead ? 'bg-primary/5' : ''}`}
                              onClick={() => !isRead && markNotificationRead(n.id)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-medium ${!isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.titre}</p>
                                {!isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                              </div>
                              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-muted-foreground/60 text-[10px] mt-1">
                                {format(new Date(n.date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Profile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="relative"
                title="Mon Profil"
              >
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Ministère d'Adoration Geneviève Brou — Tous droits réservés</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
