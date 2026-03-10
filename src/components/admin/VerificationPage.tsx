import { useState } from 'react';
import { ShieldCheck, Eye, Check, X, FileText, Camera, BarChart, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useVerificationQueue, useAdvanceStep, useScoreVehicle, useReinspectionDue } from '@/hooks/useApi';
import { verificationApi } from '@/services/api';
import type { VerificationStatus } from '@/types';

const STATUS_COLUMNS: { status: VerificationStatus; label: string; color: string }[] = [
  { status: 'SUBMITTED', label: 'Soumis', color: 'bg-blue-100' },
  { status: 'DOCS_REVIEW', label: 'Documents', color: 'bg-blue-100' },
  { status: 'PHOTOS_REVIEW', label: 'Photos', color: 'bg-blue-100' },
  { status: 'SCORED', label: 'Scoré', color: 'bg-yellow-100' },
  { status: 'INSPECTION_SCHEDULED', label: 'Inspection', color: 'bg-orange-100' },
  { status: 'PROBATION', label: 'Probation', color: 'bg-purple-100' },
  { status: 'APPROVED', label: 'Approuvé', color: 'bg-green-100' },
  { status: 'FULLY_VERIFIED', label: 'Vérifié', color: 'bg-green-100' },
];

export function VerificationPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('');
  const { data, isLoading, refetch } = useVerificationQueue(filter ? { status: filter } : undefined);
  const { data: reinspectionData } = useReinspectionDue();
  const advanceMutation = useAdvanceStep();
  const scoreMutation = useScoreVehicle();

  const queue = data?.data || data || [];
  const reinspections = reinspectionData?.data || reinspectionData || [];

  const [actionModal, setActionModal] = useState<{ vehicle: any; action: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [score, setScore] = useState(0);

  const handleAdvance = async (vehicleId: string, stepName: string, status: string) => {
    try {
      await advanceMutation.mutateAsync({
        vehicleId,
        data: { stepName, status, notes: notes || undefined },
      });
      toast({ title: 'Étape avancée' });
      setActionModal(null);
      setNotes('');
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleScore = async (vehicleId: string) => {
    try {
      await scoreMutation.mutateAsync({
        vehicleId,
        data: { score, notes: notes || undefined },
      });
      toast({ title: 'Score enregistré' });
      setActionModal(null);
      setNotes('');
      setScore(0);
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleOverride = async (vehicleId: string, newStatus: string) => {
    try {
      await verificationApi.overrideVerification(vehicleId, { newStatus, reason: notes });
      toast({ title: 'Statut modifié' });
      setActionModal(null);
      setNotes('');
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  // Group by status for kanban view
  const grouped = STATUS_COLUMNS.map((col) => ({
    ...col,
    items: queue.filter((v: any) => v.verificationStatus === col.status),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Pipeline de vérification</h1>
          <p className="text-muted-foreground">{queue.length} véhicule(s) en cours de vérification</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            {STATUS_COLUMNS.map((c) => (
              <SelectItem key={c.status} value={c.status}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {grouped.map((col) => (
          <div key={col.status} className="min-w-[240px] flex-1">
            <div className={`rounded-t-lg p-3 ${col.color} flex items-center justify-between`}>
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge variant="secondary" className="text-xs">{col.items.length}</Badge>
            </div>
            <div className="space-y-2 p-2 bg-muted/30 rounded-b-lg min-h-[200px]">
              {col.items.map((v: any) => (
                <Card key={v.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActionModal({ vehicle: v, action: 'view' })}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.plateNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {v.partner?.displayName || 'Flotte propre'}
                    </p>
                    {v.verificationScore != null && (
                      <Badge variant="outline" className="mt-1 text-xs">Score: {v.verificationScore}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reinspection due */}
      {reinspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Ré-inspections à planifier ({reinspections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Dernière inspection</TableHead>
                  <TableHead>Prochaine due</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reinspections.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.lastInspectionDate ? new Date(v.lastInspectionDate).toLocaleDateString('fr-FR') : '—'}</TableCell>
                    <TableCell>{v.nextInspectionDue ? new Date(v.nextInspectionDue).toLocaleDateString('fr-FR') : '—'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setActionModal({ vehicle: v, action: 'reinspect' })}>
                        Planifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Action modal */}
      <Dialog open={!!actionModal} onOpenChange={() => setActionModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{actionModal?.vehicle?.name} — Actions</DialogTitle>
          </DialogHeader>
          {actionModal?.vehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Statut:</span> {actionModal.vehicle.verificationStatus}</div>
                <div><span className="text-muted-foreground">Score:</span> {actionModal.vehicle.verificationScore ?? '—'}</div>
                <div><span className="text-muted-foreground">Plaque:</span> {actionModal.vehicle.plateNumber}</div>
                <div><span className="text-muted-foreground">Partenaire:</span> {actionModal.vehicle.partner?.displayName || 'N/A'}</div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes optionnelles…" />
              </div>

              {/* Score input for SCORED status */}
              {(actionModal.vehicle.verificationStatus === 'PHOTOS_REVIEW' || actionModal.vehicle.verificationStatus === 'SCORED') && (
                <div>
                  <Label>Score (0-100)</Label>
                  <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(+e.target.value)} />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            {actionModal?.vehicle?.verificationStatus === 'SUBMITTED' && (
              <Button onClick={() => handleAdvance(actionModal.vehicle.id, 'SUBMISSION', 'PASSED')}>
                <Check className="h-4 w-4 mr-1" /> Valider soumission
              </Button>
            )}
            {actionModal?.vehicle?.verificationStatus === 'DOCS_REVIEW' && (
              <Button onClick={() => handleAdvance(actionModal.vehicle.id, 'DOCUMENTS', 'PASSED')}>
                <FileText className="h-4 w-4 mr-1" /> Valider documents
              </Button>
            )}
            {actionModal?.vehicle?.verificationStatus === 'PHOTOS_REVIEW' && (
              <>
                <Button onClick={() => handleAdvance(actionModal.vehicle.id, 'PHOTOS', 'PASSED')}>
                  <Camera className="h-4 w-4 mr-1" /> Valider photos
                </Button>
                <Button variant="outline" onClick={() => handleScore(actionModal.vehicle.id)}>
                  <BarChart className="h-4 w-4 mr-1" /> Enregistrer score
                </Button>
              </>
            )}
            {actionModal?.vehicle?.verificationStatus === 'INSPECTION_SCHEDULED' && (
              <Button onClick={() => handleAdvance(actionModal.vehicle.id, 'INSPECTION', 'PASSED')}>
                <Eye className="h-4 w-4 mr-1" /> Valider inspection
              </Button>
            )}

            {/* Override */}
            <Button variant="destructive" size="sm" onClick={() => handleOverride(actionModal!.vehicle.id, 'REJECTED')}>
              <X className="h-4 w-4 mr-1" /> Rejeter
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleOverride(actionModal!.vehicle.id, 'SUSPENDED')}>
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
