import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Car, ShieldCheck, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePartnerVehicles, useSubmitVehicle } from '@/hooks/useApi';
import type { FuelType, Transmission, KmPolicy, CustodyMode } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  DOCS_REVIEW: 'bg-blue-100 text-blue-800',
  PHOTOS_REVIEW: 'bg-blue-100 text-blue-800',
  SCORED: 'bg-yellow-100 text-yellow-800',
  INSPECTION_SCHEDULED: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  PROBATION: 'bg-purple-100 text-purple-800',
  FULLY_VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

const INITIAL_FORM = {
  brand: '', model: '', year: new Date().getFullYear(), color: '', plateNumber: '', vin: '',
  currentKm: 0, fuelType: 'ESSENCE' as FuelType, transmission: 'MANUAL' as Transmission,
  seats: 5, hasAC: true, features: [] as string[], dailyRate: 0, cautionAmount: 20000,
  kmPolicy: 'UNLIMITED' as KmPolicy, custodyMode: 'PERMANENT' as CustodyMode,
};

export default function PartnerVehiclesPage() {
  const { toast } = useToast();
  const { data, isLoading } = usePartnerVehicles();
  const submitMutation = useSubmitVehicle();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const vehicles = data?.data || data || [];

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync({
        ...form,
        name: `${form.brand} ${form.model}`,
      });
      toast({ title: 'Véhicule soumis', description: 'Le processus de vérification a démarré.' });
      setAddOpen(false);
      setForm(INITIAL_FORM);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Mes véhicules</h1>
          <p className="text-muted-foreground">{vehicles.length} véhicule(s) enregistré(s)</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Ajouter un véhicule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Soumettre un véhicule</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Marque</Label><Input value={form.brand} onChange={(e) => update('brand', e.target.value)} /></div>
              <div><Label>Modèle</Label><Input value={form.model} onChange={(e) => update('model', e.target.value)} /></div>
              <div><Label>Année</Label><Input type="number" value={form.year} onChange={(e) => update('year', +e.target.value)} /></div>
              <div><Label>Couleur</Label><Input value={form.color} onChange={(e) => update('color', e.target.value)} /></div>
              <div><Label>Immatriculation</Label><Input value={form.plateNumber} onChange={(e) => update('plateNumber', e.target.value)} /></div>
              <div><Label>VIN</Label><Input value={form.vin} onChange={(e) => update('vin', e.target.value)} /></div>
              <div><Label>Km actuels</Label><Input type="number" value={form.currentKm} onChange={(e) => update('currentKm', +e.target.value)} /></div>
              <div><Label>Places</Label><Input type="number" value={form.seats} onChange={(e) => update('seats', +e.target.value)} /></div>
              <div>
                <Label>Carburant</Label>
                <Select value={form.fuelType} onValueChange={(v) => update('fuelType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESSENCE">Essence</SelectItem>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="GPL">GPL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transmission</Label>
                <Select value={form.transmission} onValueChange={(v) => update('transmission', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manuelle</SelectItem>
                    <SelectItem value="AUTOMATIC">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Tarif journalier (DA)</Label><Input type="number" value={form.dailyRate} onChange={(e) => update('dailyRate', +e.target.value)} /></div>
              <div><Label>Caution (DA)</Label><Input type="number" value={form.cautionAmount} onChange={(e) => update('cautionAmount', +e.target.value)} /></div>
              <div>
                <Label>Politique km</Label>
                <Select value={form.kmPolicy} onValueChange={(v) => update('kmPolicy', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNLIMITED">Illimité</SelectItem>
                    <SelectItem value="LIMITED">Limité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mode de garde</Label>
                <Select value={form.custodyMode} onValueChange={(v) => update('custodyMode', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERMANENT">Permanent</SelectItem>
                    <SelectItem value="TEMPORARY">Temporaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? 'Envoi…' : 'Soumettre'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead>Immatriculation</TableHead>
                <TableHead>Tarif/jour</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Vérification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun véhicule. Cliquez sur "Ajouter un véhicule" pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.year} • {v.fuelType}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{v.plateNumber}</TableCell>
                    <TableCell>{v.dailyRate?.toLocaleString()} DA</TableCell>
                    <TableCell>
                      <Badge variant={v.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[v.verificationStatus] || 'bg-gray-100 text-gray-800'}>
                        {v.verificationStatus === 'FULLY_VERIFIED' ? (
                          <><ShieldCheck className="h-3 w-3 mr-1" /> Vérifié</>
                        ) : (
                          <>{v.verificationStatus?.replace(/_/g, ' ')}</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/partner/verification?vehicle=${v.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
