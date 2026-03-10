import { DollarSign, Clock, CheckCircle, ArrowDownToLine, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerPayouts, usePartnerDashboard } from '@/hooks/useApi';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', variant: 'secondary', icon: Clock },
  PROCESSING: { label: 'En traitement', variant: 'default', icon: ArrowDownToLine },
  PAID: { label: 'Payé', variant: 'outline', icon: CheckCircle },
  FAILED: { label: 'Échoué', variant: 'destructive', icon: Clock },
};

export default function PartnerFinancesPage() {
  const { data: payoutsData, isLoading } = usePartnerPayouts();
  const { data: dashboardData } = usePartnerDashboard();

  const payouts = payoutsData?.data || payoutsData || [];
  const stats = dashboardData?.data || dashboardData;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  const totalPending = payouts
    .filter((p: any) => p.status === 'PENDING')
    .reduce((s: number, p: any) => s + p.amount, 0);

  const totalPaid = payouts
    .filter((p: any) => p.status === 'PAID')
    .reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Finances</h1>
        <p className="text-muted-foreground">Suivez vos revenus et virements</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenu total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalRevenue ?? totalPaid).toLocaleString()} DA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalPending.toLocaleString()} DA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total versé</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()} DA</div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts table */}
      <Card>
        <CardHeader><CardTitle>Historique des virements</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Réservations</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun virement pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((p: any) => {
                  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">
                        {new Date(p.periodStart).toLocaleDateString('fr-FR')} → {new Date(p.periodEnd).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-semibold">{p.amount.toLocaleString()} DA</TableCell>
                      <TableCell>{p.reservationIds?.length || 0}</TableCell>
                      <TableCell>{p.method || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <config.icon className="h-3 w-3" /> {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
