import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  // Mock data - will be replaced with real data from store
  const kpis = [
    {
      title: "Véhicules disponibles",
      value: "2/3",
      description: "aujourd'hui",
      icon: Car,
      trend: "+0 depuis hier"
    },
    {
      title: "Locations en cours",
      value: "1",
      description: "active",
      icon: Calendar,
      trend: "=0 depuis hier"
    },
    {
      title: "CA du mois",
      value: "127 500 DA",
      description: "décembre 2024",
      icon: DollarSign,
      trend: "+15% vs novembre"
    },
    {
      title: "Cautions bloquées",
      value: "45 000 DA",
      description: "en attente",
      icon: Shield,
      trend: "2 cautions"
    }
  ];

  const upcomingReservations = [
    {
      id: "1",
      vehicle: "Dacia Logan",
      client: "Ahmed Benali",
      startDate: "15/12/2024",
      endDate: "18/12/2024",
      status: "confirmed" as const
    },
    {
      id: "2", 
      vehicle: "Hyundai i10",
      client: "Fatima Kouadri",
      startDate: "20/12/2024",
      endDate: "25/12/2024",
      status: "pending" as const
    }
  ];

  const alerts = [
    {
      id: "1",
      type: "maintenance" as const,
      message: "Dacia Logan - Révision dans 500 km",
      priority: "medium" as const
    },
    {
      id: "2",
      type: "document" as const,
      message: "Assurance Hyundai i10 expire dans 30 jours",
      priority: "high" as const
    },
    {
      id: "3",
      type: "return" as const,
      message: "Retour en retard - Renault Symbol (2 jours)",
      priority: "high" as const
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de l'activité SoummamCar
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">{kpi.trend}</span>
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
              <Calendar className="h-5 w-5" />
              Réservations à venir (7 jours)
            </CardTitle>
            <CardDescription>
              Prochaines locations programmées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">{reservation.vehicle}</span>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {reservation.client}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {reservation.startDate} → {reservation.endDate}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir détail
                  </Button>
                </div>
              ))}
              {upcomingReservations.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune réservation à venir
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes et notifications
            </CardTitle>
            <CardDescription>
              Éléments nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${getPriorityColor(alert.priority)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.priority === 'high' ? 'Urgent' : 
                         alert.priority === 'medium' ? 'Moyen' : 'Faible'}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {alert.type === 'maintenance' ? 'Maintenance' :
                         alert.type === 'document' ? 'Documents' : 'Retour'}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Traiter
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};