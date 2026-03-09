import { useState } from 'react';
import { useAdminStore, Reservation } from '@/store/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Eye, FileText, X, Calendar, Car, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  in_progress: 'En cours',
  completed: 'Clôturée',
  cancelled: 'Annulée',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function ReservationDetailModal({ 
  reservation, 
  open, 
  onClose 
}: { 
  reservation: Reservation | null; 
  open: boolean; 
  onClose: () => void; 
}) {
  const { clients, vehicles, updateReservation, generateContract } = useAdminStore();
  const { toast } = useToast();

  if (!reservation) return null;
  const client = clients.find(c => c.id === reservation.clientId);
  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);

  const handleStatusChange = (status: Reservation['status']) => {
    updateReservation(reservation.id, { status });
    toast({ title: 'Statut mis à jour', description: `Réservation ${reservation.referenceNumber} → ${STATUS_LABELS[status]}` });
  };

  const handleGenerateContract = () => {
    generateContract(reservation.id);
    toast({ title: 'Contrat généré', description: 'Le contrat PDF a été généré avec succès.' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réservation {reservation.referenceNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Status control */}
          <div className="flex items-center gap-4">
            <Badge className={STATUS_STYLES[reservation.status]}>
              {STATUS_LABELS[reservation.status]}
            </Badge>
            <Select value={reservation.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" /> Client
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-semibold">{client?.fullName ?? '—'}</p>
                <p>{client?.phone}</p>
                <p>{client?.email}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="w-4 h-4" /> Véhicule
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-semibold">{vehicle?.name ?? '—'}</p>
                <p>{vehicle?.plateNumber}</p>
                <p>{reservation.dailyRate} DA/jour</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Départ: <span className="font-medium">{new Date(reservation.pickupDate).toLocaleDateString('fr-FR')}</span></p>
                <p>Retour: <span className="font-medium">{new Date(reservation.returnDate).toLocaleDateString('fr-FR')}</span></p>
                <p>Durée: <span className="font-medium">{reservation.totalDays} jours</span></p>
                <p>Lieu: {reservation.pickupLocation}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Récapitulatif financier</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Sous-total: <span className="font-medium">{reservation.subtotal.toLocaleString()} DA</span></p>
                <p>Arrhes (25%): <span className="font-medium">{reservation.deposit.toLocaleString()} DA</span></p>
                <p>Caution: <span className="font-medium">{reservation.securityDeposit.toLocaleString()} DA</span></p>
                <p className="font-bold text-primary">Total: {reservation.totalAmount.toLocaleString()} DA</p>
              </CardContent>
            </Card>
          </div>
          {reservation.specialRequests && (
            <div>
              <Label>Demandes spéciales</Label>
              <p className="text-sm mt-1 p-3 bg-secondary/30 rounded">{reservation.specialRequests}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleGenerateContract}>
            <FileText className="w-4 h-4 mr-2" /> Générer contrat PDF
          </Button>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ReservationsPage = () => {
  const { reservations, clients, vehicles, updateReservation } = useAdminStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = reservations.filter(r => {
    const client = clients.find(c => c.id === r.clientId);
    const vehicle = vehicles.find(v => v.id === r.vehicleId);
    const matchSearch = search === '' || 
      r.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      client?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      vehicle?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openDetail = (r: Reservation) => {
    setSelectedReservation(r);
    setDetailOpen(true);
  };

  const handleClose = (r: Reservation) => {
    updateReservation(r.id, { status: 'completed' });
    toast({ title: 'Réservation clôturée', description: `${r.referenceNumber} marquée comme clôturée.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Réservations</h1>
          <p className="text-muted-foreground">Gérez toutes les réservations de la flotte</p>
        </div>
        <Button className="bg-amber hover:bg-amber-dark text-amber-foreground">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle réservation
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = reservations.filter(r => r.status === key).length;
          return (
            <Card key={key} className={`cursor-pointer border-2 ${filterStatus === key ? 'border-primary' : 'border-transparent'}`} 
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher réservation, client, véhicule..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reservations table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Réf#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune réservation trouvée
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(r => {
                const client = clients.find(c => c.id === r.clientId);
                const vehicle = vehicles.find(v => v.id === r.vehicleId);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm font-semibold">{r.referenceNumber}</TableCell>
                    <TableCell>{client?.fullName ?? '—'}</TableCell>
                    <TableCell>{vehicle?.name ?? '—'}</TableCell>
                    <TableCell>{new Date(r.pickupDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(r.returnDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[r.status]}>
                        {STATUS_LABELS[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{r.totalAmount.toLocaleString()} DA</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openDetail(r)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {r.status === 'in_progress' && (
                          <Button size="sm" variant="ghost" onClick={() => handleClose(r)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReservationDetailModal
        reservation={selectedReservation}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};