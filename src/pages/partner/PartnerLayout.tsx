import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
  BarChart3, Car, Calendar, DollarSign, Settings, LogOut, ShieldCheck, Star,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarHeader, SidebarFooter, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { title: 'Tableau de bord', url: '/partner/dashboard', icon: BarChart3 },
  { title: 'Mes véhicules', url: '/partner/vehicles', icon: Car },
  { title: 'Réservations', url: '/partner/reservations', icon: Calendar },
  { title: 'Vérification', url: '/partner/verification', icon: ShieldCheck },
  { title: 'Finances', url: '/partner/finances', icon: DollarSign },
  { title: 'Avis', url: '/partner/reviews', icon: Star },
  { title: 'Profil', url: '/partner/settings', icon: Settings },
];

function PartnerSidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center text-amber-foreground font-bold">
            P
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-primary">Espace Partenaire</span>
            <span className="text-xs text-muted-foreground">{user?.fullName}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
                <LogOut className="w-4 h-4" /><span>Déconnexion</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function PartnerLayout() {
  const { isAuthenticated, isPartner, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isPartner) {
    return <Navigate to="/partner/register" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PartnerSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur px-6 flex items-center">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold text-primary">Espace Partenaire SoummamCar</h1>
          </header>
          <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
