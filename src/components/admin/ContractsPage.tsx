import { useState } from 'react';
import { useAdminStore, Reservation, ConditionReport } from '@/store/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, ClipboardList, Camera, Printer, Plus } from 'lucide-react';

const CONTRACT_STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  signed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  signed: 'Signé',
  completed: 'Clôturé',
};

function ContractPDFView({ reservation }: { reservation: Reservation }) {
  const { clients, vehicles } = useAdminStore();
  const client = clients.find(c => c.id === reservation.clientId);
  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);

  return (
    <div className="border p-6 space-y-6 bg-white text-black text-sm" id="contract-pdf">
      {/* Header */}
      <div className="flex justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">SoummamCar</h1>
          <p className="text-gray-600">Agence de location de véhicules</p>
          <p className="text-gray-600">Béjaïa, Algérie</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">CONTRAT DE LOCATION</h2>
          <p className="font-mono">Réf: {reservation.referenceNumber}</p>
          <p>Date: {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* Contract body in two columns */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border p-4 space-y-2">
          <h3 className="font-bold border-b pb-1">LOUEUR (Bailleur)</h3>
          <p>SoummamCar SARL</p>
          <p>Béjaïa, Algérie</p>
          <p>Tel: +213 555 000 000</p>
        </div>
        <div className="border p-4 space-y-2">
          <h3 className="font-bold border-b pb-1">LOCATAIRE (Preneur)</h3>
          <p className="font-semibold">{client?.fullName}</p>
          <p>CIN: {client?.idNumber}</p>
          <p>Permis: {client?.licenseNumber}</p>
          <p>Tel: {client?.phone}</p>
        </div>
      </div>

      <div className="border p-4">
        <h3 className="font-bold border-b pb-1 mb-3">VÉHICULE LOUÉ</h3>
        <div className="grid grid-cols-3 gap-4">
          <div><span className="text-gray-600">Marque/Modèle:</span> {vehicle?.name}</div>
          <div><span className="text-gray-600">Immatriculation:</span> {vehicle?.plateNumber}</div>
          <div><span className="text-gray-600">Tarif/jour:</span> {reservation.dailyRate.toLocaleString()} DA</div>
        </div>
      </div>

      <div className="border p-4">
        <h3 className="font-bold border-b pb-1 mb-3">PÉRIODE DE LOCATION</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="text-gray-600">Date de départ:</span> {new Date(reservation.pickupDate).toLocaleString('fr-FR')}</p>
            <p><span className="text-gray-600">Lieu de prise en charge:</span> {reservation.pickupLocation}</p>
          </div>
          <div>
            <p><span className="text-gray-600">Date de retour:</span> {new Date(reservation.returnDate).toLocaleString('fr-FR')}</p>
            <p><span className="text-gray-600">Durée:</span> {reservation.totalDays} jours</p>
          </div>
        </div>
      </div>

      <div className="border p-4">
        <h3 className="font-bold border-b pb-1 mb-3">CONDITIONS FINANCIÈRES</h3>
        <div className="space-y-1">
          <div className="flex justify-between"><span>Sous-total:</span><span>{reservation.subtotal.toLocaleString()} DA</span></div>
          <div className="flex justify-between"><span>Arrhes versées (25%):</span><span>{reservation.deposit.toLocaleString()} DA</span></div>
          <div className="flex justify-between"><span>Caution de garantie:</span><span>{reservation.securityDeposit.toLocaleString()} DA</span></div>
          <div className="flex justify-between font-bold border-t pt-1"><span>TOTAL:</span><span>{reservation.totalAmount.toLocaleString()} DA</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-8">
        <div className="text-center border-t pt-2">
          <p className="text-gray-600">Signature du Loueur</p>
        </div>
        <div className="text-center border-t pt-2">
          <p className="text-gray-600">Signature du Locataire</p>
        </div>
      </div>
    </div>
  );
}

function ConditionReportForm({ 
  reservationId, 
  type, 
  onSave 
}: { 
  reservationId: string; 
  type: 'pickup' | 'return'; 
  onSave: () => void;
}) {
  const { addConditionReport } = useAdminStore();
  const { toast } = useToast();
  const [kmReading, setKmReading] = useState('');
  const [fuelLevel, setFuelLevel] = useState<ConditionReport['fuelLevel']>('full');
  const [damageNotes, setDamageNotes] = useState('');

  const photoSlots = [
    { key: 'front_left', label: 'Avant gauche' },
    { key: 'front_right', label: 'Avant droit' },
    { key: 'rear_left', label: 'Arrière gauche' },
    { key: 'rear_right', label: 'Arrière droit' },
    { key: 'interior_front', label: 'Intérieur avant' },
    { key: 'interior_rear', label: 'Intérieur arrière' },
    { key: 'dashboard', label: 'Tableau de bord' },
    { key: 'trunk', label: 'Coffre' },
  ];

  const handleSave = () => {
    addConditionReport({
      reservationId,
      type,
      photos: {},
      kmReading: parseInt(kmReading) || 0,
      fuelLevel,
      damageNotes,
    });
    toast({ title: `État des lieux ${type === 'pickup' ? 'départ' : 'retour'} enregistré` });
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Kilométrage</Label>
          <Input
            type="number"
            placeholder="km..."
            value={kmReading}
            onChange={e => setKmReading(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Niveau carburant</Label>
          <Select value={fuelLevel} onValueChange={(v: ConditionReport['fuelLevel']) => setFuelLevel(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['1/4', '1/2', '3/4', 'full'].map(f => (
                <SelectItem key={f} value={f}>{f === 'full' ? 'Plein' : f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Photos ({type === 'pickup' ? 'Départ' : 'Retour'})</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {photoSlots.map(slot => (
            <div key={slot.key} className="border-2 border-dashed rounded-lg p-3 text-center hover:border-primary transition-colors cursor-pointer">
              <Camera className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{slot.label}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label>Notes sur l'état</Label>
        <Textarea
          placeholder="Observations, dommages, remarques..."
          value={damageNotes}
          onChange={e => setDamageNotes(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>
      
      <Button onClick={handleSave} className="w-full">
        Enregistrer l'état des lieux {type === 'pickup' ? 'départ' : 'retour'}
      </Button>
    </div>
  );
}

export const ContractsPage = () => {
  const { contracts, reservations, clients, vehicles, conditionReports, signContract, generateContract } = useAdminStore();
  const { toast } = useToast();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [conditionType, setConditionType] = useState<'pickup' | 'return'>('pickup');

  const handlePrint = () => window.print();

  const openContract = (r: Reservation) => {
    setSelectedReservation(r);
    setContractModalOpen(true);
  };

  const openConditionReport = (r: Reservation, type: 'pickup' | 'return') => {
    setSelectedReservation(r);
    setConditionType(type);
    setConditionModalOpen(true);
  };

  const handleSign = (contractId: string) => {
    signContract(contractId);
    toast({ title: 'Contrat signé', description: 'Le contrat a été marqué comme signé.' });
  };

  const handleGenerate = (reservationId: string) => {
    generateContract(reservationId);
    toast({ title: 'Contrat généré', description: 'Le contrat a été créé et est prêt à être signé.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Contrats & États des lieux</h1>
        <p className="text-muted-foreground">Gestion des contrats et des documents d'état</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contracts list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Contrats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map(r => {
                  const contract = contracts.find(c => c.reservationId === r.id);
                  const client = clients.find(c => c.id === r.clientId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.referenceNumber}</TableCell>
                      <TableCell className="text-sm">{client?.fullName}</TableCell>
                      <TableCell>
                        {contract ? (
                          <Badge className={CONTRACT_STATUS_STYLES[contract.status]}>
                            {CONTRACT_STATUS_LABELS[contract.status]}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Aucun</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!contract ? (
                            <Button size="sm" variant="outline" onClick={() => handleGenerate(r.id)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => openContract(r)}>
                                <Printer className="w-3 h-3" />
                              </Button>
                              {contract.status === 'draft' && (
                                <Button size="sm" variant="ghost" onClick={() => handleSign(contract.id)}>
                                  Signer
                                </Button>
                              )}
                            </>
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

        {/* Condition reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> États des lieux
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf#</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Retour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map(r => {
                  const vehicle = vehicles.find(v => v.id === r.vehicleId);
                  const pickupReport = conditionReports.find(cr => cr.reservationId === r.id && cr.type === 'pickup');
                  const returnReport = conditionReports.find(cr => cr.reservationId === r.id && cr.type === 'return');
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.referenceNumber}</TableCell>
                      <TableCell className="text-sm">{vehicle?.name}</TableCell>
                      <TableCell>
                        {pickupReport ? (
                          <Badge className="bg-green-100 text-green-800">Fait</Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => openConditionReport(r, 'pickup')}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {returnReport ? (
                          <Badge className="bg-green-100 text-green-800">Fait</Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => openConditionReport(r, 'return')}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Contract print modal */}
      {selectedReservation && (
        <Dialog open={contractModalOpen} onOpenChange={() => setContractModalOpen(false)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contrat — {selectedReservation.referenceNumber}</DialogTitle>
            </DialogHeader>
            <ContractPDFView reservation={selectedReservation} />
            <DialogFooter>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Imprimer / PDF
              </Button>
              <Button variant="outline" onClick={() => setContractModalOpen(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Condition report modal */}
      {selectedReservation && (
        <Dialog open={conditionModalOpen} onOpenChange={() => setConditionModalOpen(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                État des lieux {conditionType === 'pickup' ? 'départ' : 'retour'} — {selectedReservation.referenceNumber}
              </DialogTitle>
            </DialogHeader>
            <ConditionReportForm
              reservationId={selectedReservation.id}
              type={conditionType}
              onSave={() => setConditionModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};