import { useAdminStore } from '@/store/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Car, 
  Calendar, 
  DollarSign, 
  Shield,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

export const AdminDashboard = () => {
  const { vehicles, reservations, clients, payments, maintenanceRecords } = useAdminStore();

  const today = new Date();

  // Real KPI calculations
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const totalVehicles = vehicles.length;
  const rentedVehicles = reservations.filter(r => r.status === 'in_progress').length;
  
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthRevenue = payments
    .filter(p => {
      if (!p.paidAt || p.type === 'security_deposit') return false;
      const d = new Date(p.paidAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.status === 'paid';
    })
    .reduce((sum, p) => sum + p.amount, 0);
  
  const blockedDeposits = payments
    .filter(p => p.type === 'security_deposit' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const kpis = [
    {
      title: "Véhicules disponibles",
      value: `${availableVehicles}/${totalVehicles}`,
      description: "aujourd'hui",
      icon: Car,
      trend: `${vehicles.filter(v => v.status === 'rented').length} en location`
    },
    {
      title: "Locations en cours",
      value: rentedVehicles.toString(),
      description: "actives",
      icon: Calendar,
      trend: `${reservations.filter(r => r.status === 'confirmed').length} confirmées à venir`
    },
    {
      title: "CA du mois",
      value: `${monthRevenue.toLocaleString()} DA`,
      description: `${today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`,
      icon: DollarSign,
      trend: `${payments.filter(p => p.status === 'paid').length} paiements reçus`
    },
    {
      title: "Cautions bloquées",
      value: `${blockedDeposits.toLocaleString()} DA`,
      description: "en attente restitution",
      icon: Shield,
      trend: `${payments.filter(p => p.type === 'security_deposit' && p.status === 'paid').length} cautions`
    }
  ];

  // Upcoming reservations next 7 days
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcoming = reservations
    .filter(r => {
      const d = new Date(r.pickupDate);
      return d >= today && d <= nextWeek && r.status !== 'cancelled';
    })
    .slice(0, 5);

  // Alerts
  const alerts: Array<{ id: string; type: string; message: string; priority: 'high' | 'medium' | 'low' }> = [];
  
  // Document expiry alerts
  vehicles.forEach(v => {
    const docChecks = [
      { expiry: v.insuranceExpiry, label: `Assurance ${v.name}` },
      { expiry: v.controleTechniqueExpiry, label: `CT ${v.name}` },
      { expiry: v.vignetteExpiry, label: `Vignette ${v.name}` },
    ];
    docChecks.forEach(({ expiry, label }) => {
      const daysLeft = Math.floor((new Date(expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) alerts.push({ id: `${v.id}-${label}`, type: 'document', message: `${label} — EXPIRÉ`, priority: 'high' });
      else if (daysLeft <= 30) alerts.push({ id: `${v.id}-${label}`, type: 'document', message: `${label} expire dans ${daysLeft} jours`, priority: 'high' });
    });
    // Maintenance alert
    if (v.currentKm >= v.nextServiceKm - 1000) {
      alerts.push({ id: `maint-${v.id}`, type: 'maintenance', message: `${v.name} — Révision dans ${v.nextServiceKm - v.currentKm} km`, priority: 'medium' });
    }
  });

  // Late returns
  reservations.filter(r => r.status === 'in_progress' && new Date(r.returnDate) < today).forEach(r => {
    const client = clients.find(c => c.id === r.clientId);
    const vehicle = vehicles.find(v => v.id === r.vehicleId);
    const daysLate = Math.floor((today.getTime() - new Date(r.returnDate).getTime()) / (1000 * 60 * 60 * 24));
    alerts.push({ 
      id: `late-${r.id}`, 
      type: 'return', 
      message: `Retard: ${vehicle?.name} — ${client?.fullName} (${daysLate}j)`, 
      priority: 'high' 
    });
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">En attente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">En cours</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-600 dark:text-amber-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité SoummamCar</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">{kpi.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Réservations à venir (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming.map(r => {
                const client = clients.find(c => c.id === r.clientId);
                const vehicle = vehicles.find(v => v.id === r.vehicleId);
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">{vehicle?.name}</span>
                        {getStatusBadge(r.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {client?.fullName}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(r.pickupDate).toLocaleDateString('fr-FR')} → {new Date(r.returnDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcoming.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune réservation à venir dans les 7 jours
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Alertes ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  ✅ Aucune alerte en ce moment
                </div>
              )}
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${getPriorityColor(alert.priority)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <Badge 
                      variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {alert.priority === 'high' ? 'Urgent' : 
                       alert.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};