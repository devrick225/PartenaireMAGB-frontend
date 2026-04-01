import { useLocation, useNavigate, Link } from 'react-router-dom';
import logoMagb from '@/assets/logo-magb.png';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Home, Heart, LogOut, Sun, Moon, Wallet, ChevronUp, Users, Link2, Send, FileText, User, MessageSquare } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Sidebar navigation component
export function AppSidebar() {
  const { user, profile, logout, isAdmin, getGamificationLevel } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const gamificationLevel = getGamificationLevel();

  const navItems = [
    { to: '/dashboard', label: 'Tableau de bord', icon: Home },
    { to: '/donations', label: 'Faire un don', icon: Heart },
    { to: '/paiements', label: 'Paiements', icon: Wallet },
    { to: '/documents', label: 'Mes reçus', icon: FileText },
    { to: '/support', label: 'Support', icon: MessageSquare },
    { to: '/profile', label: 'Mon profil', icon: User },
  ];

  const adminItems = [
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/admin/dons', label: 'Dons', icon: Heart },
    { to: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
    { to: '/admin/notifications', label: 'Notifications', icon: Send },
    { to: '/admin/liens', label: 'Liens utiles', icon: Link2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logoMagb} alt="MAGB" className="w-10 h-10 shrink-0 object-contain" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base text-sidebar-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Partenaire
              </span>
              <span className="font-bold text-sm text-sidebar-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                MAGB
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    tooltip={item.label}
                  >
                    <NavLink to={item.to} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map(item => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.to}
                      tooltip={item.label}
                    >
                      <NavLink to={item.to} end>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
                      <span className="text-sidebar-primary-foreground font-bold text-sm">
                        {user?.prenoms?.[0]}{user?.nom?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.prenoms} {user?.nom}</span>
                    <span className={`truncate text-xs ${gamificationLevel.color}`}>
                      Niveau {gamificationLevel.level}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="top" align="start" sideOffset={8}>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="gap-2 cursor-pointer">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
