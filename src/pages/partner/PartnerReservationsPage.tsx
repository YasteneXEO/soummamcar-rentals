import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerReservations } from '@/hooks/useApi';

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'En attente', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmée', variant: 'default' },
  IN_PROGRESS: { label: 'En cours', variant: 'default' },
  COMPLETED: { label: 'Terminée', variant: 'outline' },
  CANCELLED: { label: 'Annulée', variant: 'destructive' },
  DISPUTED: { label: 'Litige', variant: 'destructive' },
};

export default function PartnerReservationsPage() {
  const { data, isLoading } = usePartnerReservations();
  const reservations = data?.data || data || [];

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Réservations</h1>
        <p className="text-muted-foreground">Suivez les locations de vos véhicules</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Réf.</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Votre part</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune réservation pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((r: any) => {
                  const si = STATUS_LABELS[r.status] || { label: r.status, variant: 'outline' as const };
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.referenceNumber}</TableCell>
                      <TableCell>
                        <p className="font-medium">{r.vehicle?.name || '—'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(r.pickupDate).toLocaleDateString('fr-FR')}</p>
                          <p className="text-muted-foreground">→ {new Date(r.returnDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </TableCell>
                      <TableCell>{r.totalClient?.toLocaleString() || r.subtotal?.toLocaleString()} DA</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {r.partnerPayout?.toLocaleString() || '—'} DA
                      </TableCell>
                      <TableCell><Badge variant={si.variant}>{si.label}</Badge></TableCell>
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
