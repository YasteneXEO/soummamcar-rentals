import { useState } from 'react';
import { useAdminStore, Payment } from '@/store/adminStore';
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, AlertTriangle, CheckCircle, Printer, DollarSign, Shield, Scale } from 'lucide-react';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  baridimob: 'BaridiMob',
  cib: 'CIB',
  cash: 'Espèces',
};

const CAUTION_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Bloquée',
  refunded: 'Restituée',
  partially_retained: 'Retenue partielle',
  retained: 'Retenue totale',
  disputed: 'Litige en cours',
};

const CAUTION_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  refunded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  partially_retained: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  retained: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  disputed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

interface CautionModalState {
  open: boolean;
  payment: Payment | null;
  action: 'refund' | 'partial_retain' | 'retain' | 'dispute' | null;
}

export const PaymentsPage = () => {
  const { reservations, payments, clients, vehicles, updatePayment, addPayment } = useAdminStore();
  const { toast } = useToast();
  const [cautionModal, setCautionModal] = useState<CautionModalState>({ open: false, payment: null, action: null });
  const [retainedAmount, setRetainedAmount] = useState('');
  const [retainedReason, setRetainedReason] = useState('');

  const handleMarkPaid = (reservationId: string, amount: number, type: 'deposit' | 'balance' | 'security_deposit') => {
    addPayment({
      reservationId,
      type,
      amount,
      method: type === 'deposit' ? 'baridimob' : 'cash',
      status: 'paid',
      paidAt: new Date().toISOString()
    });
    toast({ 
      title: 'Paiement effectué', 
      description: `Le paiement de ${amount.toLocaleString()} DA a été enregistré.` 
    });
  };

  const openCautionAction = (payment: Payment, action: CautionModalState['action']) => {
    setCautionModal({ open: true, payment, action });
    setRetainedAmount('');
    setRetainedReason('');
  };

  const handleCautionAction = () => {
    const { payment, action } = cautionModal;
    if (!payment || !action) return;

    const now = new Date().toISOString();

    switch (action) {
      case 'refund':
        updatePayment(payment.id, { status: 'refunded', paidAt: now, notes: retainedReason || 'Caution restituée intégralement' });
        toast({ title: 'Caution restituée', description: `${payment.amount.toLocaleString()} DA restitués au client.` });
        break;
      case 'partial_retain':
        const amount = parseInt(retainedAmount);
        if (!amount || amount <= 0 || amount >= payment.amount) {
          toast({ title: 'Montant invalide', description: `Le montant doit être entre 1 et ${payment.amount - 1} DA.` });
          return;
        }
        updatePayment(payment.id, { 
          status: 'partially_retained', 
          paidAt: now,
          retainedAmount: amount,
          retainedReason: retainedReason || 'Retenue partielle'
        });
        toast({ 
          title: 'Retenue partielle', 
          description: `${amount.toLocaleString()} DA retenus, ${(payment.amount - amount).toLocaleString()} DA restitués.` 
        });
        break;
      case 'retain':
        updatePayment(payment.id, { 
          status: 'retained', 
          paidAt: now,
          retainedAmount: payment.amount,
          retainedReason: retainedReason || 'Caution retenue intégralement'
        });
        toast({ title: 'Caution retenue', description: `${payment.amount.toLocaleString()} DA retenus.` });
        break;
      case 'dispute':
        updatePayment(payment.id, { 
          status: 'disputed', 
          notes: retainedReason || 'Litige ouvert'
        });
        toast({ title: 'Litige ouvert', description: 'La caution est en litige.' });
        break;
    }
    setCautionModal({ open: false, payment: null, action: null });
  };

  const handleExportPDF = () => {
    window.print();
    toast({ title: 'Export PDF', description: 'La fenêtre d\'impression est ouverte.' });
  };

  // Summary calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyPayments = payments.filter(p => {
    if (!p.paidAt) return false;
    const d = new Date(p.paidAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalCollectedMonth = monthlyPayments
    .filter(p => p.status === 'paid' && p.type !== 'security_deposit')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCautionsHeld = payments
    .filter(p => p.type === 'security_deposit' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRetained = payments
    .filter(p => p.type === 'security_deposit' && (p.status === 'partially_retained' || p.status === 'retained'))
    .reduce((sum, p) => sum + (p.retainedAmount ?? 0), 0);

  const totalDisputed = payments
    .filter(p => p.type === 'security_deposit' && p.status === 'disputed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstanding = reservations
    .filter(r => r.status !== 'cancelled' && r.status !== 'completed')
    .reduce((sum, r) => {
      const paid = payments
        .filter(p => p.reservationId === r.id && p.status === 'paid' && p.type !== 'security_deposit')
        .reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, r.totalAmount - paid);
    }, 0);

  // Cautions needing action (rental completed, caution still blocked)
  const pendingCautions = payments.filter(p => {
    if (p.type !== 'security_deposit' || p.status !== 'paid') return false;
    const reservation = reservations.find(r => r.id === p.reservationId);
    return reservation?.status === 'completed';
  });

  // Disputed cautions
  const disputedCautions = payments.filter(p => p.type === 'security_deposit' && p.status === 'disputed');

  const getActionTitle = () => {
    switch (cautionModal.action) {
      case 'refund': return 'Restituer la caution';
      case 'partial_retain': return 'Retenue partielle';
      case 'retain': return 'Retenue totale';
      case 'dispute': return 'Ouvrir un litige';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Paiements & Cautions</h1>
          <p className="text-muted-foreground">Suivi financier de toutes les locations</p>
        </div>
        <Button variant="outline" onClick={handleExportPDF}>
          <Printer className="w-4 h-4 mr-2" /> Export PDF mensuel
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CA collecté ce mois</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCollectedMonth.toLocaleString()} DA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cautions bloquées</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCautionsHeld.toLocaleString()} DA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Montant retenu</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalRetained.toLocaleString()} DA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En litige</CardTitle>
            <Scale className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalDisputed.toLocaleString()} DA</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending caution alerts */}
      {pendingCautions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="w-5 h-5" />
              Cautions à traiter ({pendingCautions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingCautions.map(p => {
                const reservation = reservations.find(r => r.id === p.reservationId);
                const client = clients.find(c => c.id === reservation?.clientId);
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white dark:bg-background border rounded-lg">
                    <div>
                      <p className="font-semibold">{client?.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation?.referenceNumber} — Caution: {p.amount.toLocaleString()} DA
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-green-500 text-green-700 hover:bg-green-50"
                        onClick={() => openCautionAction(p, 'refund')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Restituer
                      </Button>
                      <Button size="sm" variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-50"
                        onClick={() => openCautionAction(p, 'partial_retain')}>
                        Retenue partielle
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500 text-red-700 hover:bg-red-50"
                        onClick={() => openCautionAction(p, 'retain')}>
                        Retenue totale
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-500 text-purple-700 hover:bg-purple-50"
                        onClick={() => openCautionAction(p, 'dispute')}>
                        <Scale className="w-4 h-4 mr-1" /> Litige
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disputed cautions */}
      {disputedCautions.length > 0 && (
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Scale className="w-5 h-5" />
              Litiges en cours ({disputedCautions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disputedCautions.map(p => {
                const reservation = reservations.find(r => r.id === p.reservationId);
                const client = clients.find(c => c.id === reservation?.clientId);
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white dark:bg-background border rounded-lg">
                    <div>
                      <p className="font-semibold">{client?.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation?.referenceNumber} — {p.amount.toLocaleString()} DA
                      </p>
                      {p.notes && <p className="text-xs text-muted-foreground mt-1">📝 {p.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-green-500 text-green-700 hover:bg-green-50"
                        onClick={() => openCautionAction(p, 'refund')}>
                        Restituer
                      </Button>
                      <Button size="sm" variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-50"
                        onClick={() => openCautionAction(p, 'partial_retain')}>
                        Retenue partielle
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500 text-red-700 hover:bg-red-50"
                        onClick={() => openCautionAction(p, 'retain')}>
                        Retenue totale
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full payments table */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des paiements par réservation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Réf#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Arrhes</TableHead>
                <TableHead>Solde restant</TableHead>
                <TableHead>Caution</TableHead>
                <TableHead>Statut caution</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune réservation
                  </TableCell>
                </TableRow>
              )}
              {reservations.map(r => {
                const client = clients.find(c => c.id === r.clientId);
                const depositPayment = payments.find(p => p.reservationId === r.id && p.type === 'deposit');
                const balancePayment = payments.find(p => p.reservationId === r.id && p.type === 'balance');
                const cautionPayment = payments.find(p => p.reservationId === r.id && p.type === 'security_deposit');
                const remainingBalance = r.subtotal - r.deposit;

                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.referenceNumber}</TableCell>
                    <TableCell className="font-medium">{client?.fullName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{r.deposit.toLocaleString()} DA</p>
                        {depositPayment ? (
                          <p className="text-xs text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[depositPayment.method]} • {depositPayment.paidAt ? new Date(depositPayment.paidAt).toLocaleDateString('fr-FR') : '—'}
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-orange-500">En attente</p>
                            {r.deposit > 0 && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleMarkPaid(r.id, r.deposit, 'deposit')}>
                                Encaisser
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{remainingBalance.toLocaleString()} DA</p>
                        {balancePayment ? (
                          <p className="text-xs text-green-600">Payé le {new Date(balancePayment.paidAt!).toLocaleDateString('fr-FR')}</p>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-orange-500">En attente</p>
                            {remainingBalance > 0 && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleMarkPaid(r.id, remainingBalance, 'balance')}>
                                Encaisser
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{r.securityDeposit.toLocaleString()} DA</TableCell>
                    <TableCell>
                      {cautionPayment ? (
                        <div className="space-y-1">
                          <Badge className={CAUTION_STATUS_STYLES[cautionPayment.status]}>
                            {CAUTION_STATUS_LABELS[cautionPayment.status]}
                          </Badge>
                          {cautionPayment.status === 'partially_retained' && cautionPayment.retainedAmount && (
                            <p className="text-xs text-muted-foreground">
                              Retenu: {cautionPayment.retainedAmount.toLocaleString()} DA
                              <br />Rendu: {(cautionPayment.amount - cautionPayment.retainedAmount).toLocaleString()} DA
                            </p>
                          )}
                          {cautionPayment.retainedReason && (
                            <p className="text-xs text-muted-foreground">📝 {cautionPayment.retainedReason}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="outline">—</Badge>
                          {r.securityDeposit > 0 && (
                            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleMarkPaid(r.id, r.securityDeposit, 'security_deposit')}>
                              Bloquer
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">{r.totalAmount.toLocaleString()} DA</TableCell>
                  </TableRow>
                );
              })}
              {/* Summary row */}
              <TableRow className="bg-secondary/30 font-bold">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>{reservations.reduce((s, r) => s + r.deposit, 0).toLocaleString()} DA</TableCell>
                <TableCell>—</TableCell>
                <TableCell>{totalCautionsHeld.toLocaleString()} DA</TableCell>
                <TableCell>—</TableCell>
                <TableCell>{reservations.reduce((s, r) => s + r.totalAmount, 0).toLocaleString()} DA</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Caution action modal */}
      <Dialog open={cautionModal.open} onOpenChange={(o) => !o && setCautionModal({ open: false, payment: null, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              Caution de {cautionModal.payment?.amount.toLocaleString()} DA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {cautionModal.action === 'partial_retain' && (
              <div className="space-y-2">
                <Label>Montant retenu (DA)</Label>
                <Input 
                  type="number" 
                  placeholder={`Max: ${(cautionModal.payment?.amount ?? 0) - 1}`}
                  value={retainedAmount} 
                  onChange={e => setRetainedAmount(e.target.value)} 
                />
                {retainedAmount && parseInt(retainedAmount) > 0 && (
                  <p className="text-sm text-muted-foreground">
                    → Montant restitué au client : {((cautionModal.payment?.amount ?? 0) - parseInt(retainedAmount)).toLocaleString()} DA
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>
                {cautionModal.action === 'dispute' ? 'Motif du litige' : 'Motif / Notes'}
              </Label>
              <Textarea
                placeholder={
                  cautionModal.action === 'refund' ? 'Véhicule rendu en bon état (optionnel)' :
                  cautionModal.action === 'dispute' ? 'Décrivez le motif du litige...' :
                  'Décrivez les dégâts ou le motif de la retenue...'
                }
                value={retainedReason}
                onChange={e => setRetainedReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCautionModal({ open: false, payment: null, action: null })}>
              Annuler
            </Button>
            <Button
              onClick={handleCautionAction}
              className={
                cautionModal.action === 'refund' ? 'bg-green-600 hover:bg-green-700' :
                cautionModal.action === 'dispute' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-destructive hover:bg-destructive/90'
              }
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
