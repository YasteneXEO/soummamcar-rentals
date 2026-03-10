import { Car, Calendar, DollarSign, TrendingUp, Star, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerDashboard, usePartnerVehicles, usePartnerReservations } from '@/hooks/useApi';

export default function PartnerDashboard() {
  const { data: dashboard, isLoading } = usePartnerDashboard();
  const { data: vehiclesData } = usePartnerVehicles();
  const { data: reservationsData } = usePartnerReservations({ status: 'IN_PROGRESS' });

  const stats = dashboard?.data || dashboard;
  const vehicles = vehiclesData?.data || vehiclesData || [];
  const activeReservations = reservationsData?.data || reservationsData || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Véhicules actifs',
      value: `${stats?.activeVehicles ?? 0}/${stats?.totalVehicles ?? 0}`,
      icon: Car,
      description: `${stats?.vehiclesInVerification ?? 0} en vérification`,
    },
    {
      title: 'Locations ce mois',
      value: stats?.totalRentals?.toString() ?? '0',
      icon: Calendar,
      description: `${activeReservations.length} en cours`,
    },
    {
      title: 'Revenus du mois',
      value: `${(stats?.monthlyRevenue ?? 0).toLocaleString()} DA`,
      icon: DollarSign,
      description: `Total: ${(stats?.totalRevenue ?? 0).toLocaleString()} DA`,
    },
    {
      title: 'Note moyenne',
      value: stats?.averageRating?.toFixed(1) ?? '—',
      icon: Star,
      description: `${stats?.pendingPayouts ?? 0} virements en attente`,
    },
  ];

  // Vehicles awaiting verification
  const pendingVerification = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => !['FULLY_VERIFIED', 'APPROVED'].includes(v.verificationStatus))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité partenaire</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpi.value}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Locations en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeReservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucune location en cours</p>
              ) : (
                activeReservations.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{r.vehicle?.name || 'Véhicule'}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(r.pickupDate).toLocaleDateString('fr-FR')} → {new Date(r.returnDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant="default">En cours</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Statut vérification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingVerification.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  ✅ Tous vos véhicules sont vérifiés
                </div>
              ) : (
                pendingVerification.slice(0, 5).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-sm text-muted-foreground">{v.plateNumber}</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {v.verificationStatus?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
