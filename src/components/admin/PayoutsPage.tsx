import { useState } from 'react';
import { DollarSign, Clock, CheckCircle, ArrowDownToLine, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePayouts, useGeneratePayouts } from '@/hooks/useApi';
import { payoutsApi } from '@/services/api';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  PENDING: { label: 'En attente', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Traitement', variant: 'default', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Payé', variant: 'outline', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Échoué', variant: 'destructive', color: 'bg-red-100 text-red-800' },
};

export function PayoutsPage() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = usePayouts();
  const generateMutation = useGeneratePayouts();
  const payouts = data?.data || data || [];

  const [processModal, setProcessModal] = useState<any>(null);
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER');

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync();
      toast({ title: 'Virements générés' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleProcess = async (payoutId: string) => {
    try {
      await payoutsApi.process(payoutId, { method, reference });
      toast({ title: 'Virement en traitement' });
      setProcessModal(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
    try {
      await payoutsApi.markPaid(payoutId, { reference });
      toast({ title: 'Virement marqué comme payé' });
      setProcessModal(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  const totalPending = payouts.filter((p: any) => p.status === 'PENDING').reduce((s: number, p: any) => s + p.amount, 0);
  const totalProcessing = payouts.filter((p: any) => p.status === 'PROCESSING').reduce((s: number, p: any) => s + p.amount, 0);
  const totalPaid = payouts.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Virements partenaires</h1>
          <p className="text-muted-foreground">{payouts.length} virement(s)</p>
        </div>
        <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          Générer les virements
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <div className="text-sm text-muted-foreground">En attente</div>
              <div className="text-xl font-bold">{totalPending.toLocaleString()} DA</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <ArrowDownToLine className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">En traitement</div>
              <div className="text-xl font-bold">{totalProcessing.toLocaleString()} DA</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Payé</div>
              <div className="text-xl font-bold text-green-600">{totalPaid.toLocaleString()} DA</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partenaire</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Réservations</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun virement. Cliquez sur "Générer les virements" pour démarrer.
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((p: any) => {
                  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.partner?.displayName || p.partnerId}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(p.periodStart).toLocaleDateString('fr-FR')} → {new Date(p.periodEnd).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-semibold">{p.amount.toLocaleString()} DA</TableCell>
                      <TableCell>{p.reservationIds?.length || 0}</TableCell>
                      <TableCell><Badge className={config.color}>{config.label}</Badge></TableCell>
                      <TableCell>
                        {p.status === 'PENDING' && (
                          <Button size="sm" variant="outline" onClick={() => { setProcessModal(p); setReference(''); }}>
                            Traiter
                          </Button>
                        )}
                        {p.status === 'PROCESSING' && (
                          <Button size="sm" onClick={() => { setProcessModal(p); setReference(p.reference || ''); }}>
                            Confirmer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Process modal */}
      <Dialog open={!!processModal} onOpenChange={() => setProcessModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processModal?.status === 'PENDING' ? 'Traiter le virement' : 'Confirmer le paiement'}
            </DialogTitle>
          </DialogHeader>
          {processModal && (
            <div className="space-y-4">
              <p className="text-sm">
                <strong>{processModal.partner?.displayName}</strong> — {processModal.amount.toLocaleString()} DA
              </p>
              <div>
                <Label>Référence du virement</Label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="N° virement bancaire" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessModal(null)}>Annuler</Button>
            {processModal?.status === 'PENDING' && (
              <Button onClick={() => handleProcess(processModal.id)}>Lancer le traitement</Button>
            )}
            {processModal?.status === 'PROCESSING' && (
              <Button onClick={() => handleMarkPaid(processModal.id)}>Marquer comme payé</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
