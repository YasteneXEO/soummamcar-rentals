import { useState } from 'react';
import { useAdminStore, Vehicle } from '@/store/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Car, Settings, Clock, AlertTriangle, Wrench, FileText } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rented: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  unavailable: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  rented: 'En location',
  maintenance: 'En maintenance',
  unavailable: 'Indisponible',
};

function getDocumentStatus(expiryDateStr: string): { label: string; style: string; daysLeft: number } {
  const today = new Date();
  const expiry = new Date(expiryDateStr);
  const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return { label: `Expiré (${Math.abs(daysLeft)}j)`, style: 'text-red-600 font-semibold', daysLeft };
  if (daysLeft <= 30) return { label: `${daysLeft}j restants`, style: 'text-orange-500 font-semibold', daysLeft };
  if (daysLeft <= 90) return { label: `${daysLeft}j restants`, style: 'text-amber-600', daysLeft };
  return { label: `${daysLeft}j restants`, style: 'text-green-600', daysLeft };
}

function VehicleDetailModal({ vehicle, open, onClose }: { 
  vehicle: Vehicle | null; 
  open: boolean; 
  onClose: () => void; 
}) {
  const { maintenanceRecords, reservations, clients, updateVehicle } = useAdminStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'maintenance' | 'history'>('info');

  if (!vehicle) return null;

  const vehicleMaintenance = maintenanceRecords.filter(m => m.vehicleId === vehicle.id);
  const vehicleReservations = reservations.filter(r => r.vehicleId === vehicle.id);

  const insuranceStatus = getDocumentStatus(vehicle.insuranceExpiry);
  const ctStatus = getDocumentStatus(vehicle.controleTechniqueExpiry);
  const vignetteStatus = getDocumentStatus(vehicle.vignetteExpiry);

  const handleSetMaintenance = () => {
    updateVehicle(vehicle.id, { status: 'maintenance' });
    toast({ title: 'Véhicule mis en maintenance' });
  };
  const handleSetAvailable = () => {
    updateVehicle(vehicle.id, { status: 'available' });
    toast({ title: 'Véhicule remis disponible' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Car className="w-5 h-5" />
            {vehicle.name} — {vehicle.plateNumber}
            <Badge className={STATUS_STYLES[vehicle.status]}>{STATUS_LABELS[vehicle.status]}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { key: 'info', label: 'Informations' },
            { key: 'maintenance', label: 'Maintenance' },
            { key: 'history', label: 'Historique' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'info' | 'maintenance' | 'history')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Vehicle info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Kilométrage actuel</p>
                <p className="font-semibold">{vehicle.currentKm.toLocaleString()} km</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Prochaine révision</p>
                <p className="font-semibold">{vehicle.nextServiceKm.toLocaleString()} km</p>
                {vehicle.currentKm >= vehicle.nextServiceKm - 1000 && (
                  <p className="text-xs text-orange-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Révision imminente
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tarif journalier</p>
                <p className="font-semibold">{vehicle.dailyRate.toLocaleString()} DA/jour</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Année</p>
                <p className="font-semibold">{vehicle.year}</p>
              </div>
            </div>
            
            {/* Documents */}
            <div>
              <p className="font-semibold mb-3">Documents légaux</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Assurance</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(vehicle.insuranceExpiry).toLocaleDateString('fr-FR')}</p>
                    <p className={`text-xs ${insuranceStatus.style}`}>{insuranceStatus.label}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Contrôle Technique</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(vehicle.controleTechniqueExpiry).toLocaleDateString('fr-FR')}</p>
                    <p className={`text-xs ${ctStatus.style}`}>{ctStatus.label}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Vignette</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(vehicle.vignetteExpiry).toLocaleDateString('fr-FR')}</p>
                    <p className={`text-xs ${vignetteStatus.style}`}>{vignetteStatus.label}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Km</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleMaintenance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Aucune intervention enregistrée
                    </TableCell>
                  </TableRow>
                )}
                {vehicleMaintenance.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{m.km.toLocaleString()} km</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.cost.toLocaleString()} DA</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Retour</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleReservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Aucune location enregistrée
                    </TableCell>
                  </TableRow>
                )}
                {vehicleReservations.map(r => {
                  const client = clients.find(c => c.id === r.clientId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.referenceNumber}</TableCell>
                      <TableCell>{client?.fullName ?? '—'}</TableCell>
                      <TableCell>{new Date(r.pickupDate).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{new Date(r.returnDate).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[r.status] ?? ''} variant="secondary">
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.totalAmount.toLocaleString()} DA</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {vehicle.status === 'available' && (
            <Button variant="outline" onClick={handleSetMaintenance}>
              <Wrench className="w-4 h-4 mr-2" /> Mettre en maintenance
            </Button>
          )}
          {vehicle.status === 'maintenance' && (
            <Button onClick={handleSetAvailable}>
              <Car className="w-4 h-4 mr-2" /> Marquer disponible
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const FleetPage = () => {
  const { vehicles, reservations, maintenanceRecords } = useAdminStore();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (v: Vehicle) => {
    setSelectedVehicle(v);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Flotte</h1>
          <p className="text-muted-foreground">Gérez vos véhicules et leur état</p>
        </div>
        <Button className="bg-amber hover:bg-amber-dark text-amber-foreground">
          <Car className="w-4 h-4 mr-2" /> Ajouter un véhicule
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = vehicles.filter(v => v.status === key).length;
          return (
            <Card key={key}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{count}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vehicle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => {
          const insuranceStatus = getDocumentStatus(vehicle.insuranceExpiry);
          const hasDocumentAlert = insuranceStatus.daysLeft <= 30 || 
            getDocumentStatus(vehicle.controleTechniqueExpiry).daysLeft <= 30;
          const hasMaintenanceAlert = vehicle.currentKm >= vehicle.nextServiceKm - 1000;
          
          return (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(vehicle)}>
              <div className="relative h-40 bg-secondary/50">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <Badge className={`absolute top-3 right-3 ${STATUS_STYLES[vehicle.status]}`}>
                  {STATUS_LABELS[vehicle.status]}
                </Badge>
                {(hasDocumentAlert || hasMaintenanceAlert) && (
                  <div className="absolute top-3 left-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 bg-white rounded-full p-0.5" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-primary">{vehicle.name}</h3>
                  <span className="text-sm font-mono text-muted-foreground">{vehicle.plateNumber}</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Settings className="w-3 h-3" />
                    <span>{vehicle.currentKm.toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Révision à {vehicle.nextServiceKm.toLocaleString()} km</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="font-semibold text-primary">{vehicle.dailyRate.toLocaleString()} DA/jour</span>
                  <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); openDetail(vehicle); }}>
                    Détail
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};