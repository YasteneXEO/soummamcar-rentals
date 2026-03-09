import { Outlet, Navigate } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Car, 
  Users, 
  FileText, 
  CreditCard, 
  Settings,
  LogOut
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/store/adminStore';
import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { title: 'Tableau de bord', url: '/admin/dashboard', icon: BarChart3 },
  { title: 'Réservations', url: '/admin/reservations', icon: Calendar },
  { title: 'Flotte', url: '/admin/fleet', icon: Car },
  { title: 'Clients (CRM)', url: '/admin/clients', icon: Users },
  { title: 'Contrats & États', url: '/admin/contracts', icon: FileText },
  { title: 'Paiements & Cautions', url: '/admin/payments', icon: CreditCard },
  { title: 'Paramètres', url: '/admin/settings', icon: Settings },
];

function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAdminStore();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            SC
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-primary">SoummamCar</span>
            <span className="text-xs text-muted-foreground">Administration</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation principale</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export const AdminLayout = () => {
  const { isAuthenticated } = useAdminStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-primary">Espace d'administration</h1>
            </div>
          </header>
          <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};