import { useAdminStore } from '@/store/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, AlertTriangle, CheckCircle, Printer, DollarSign } from 'lucide-react';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  baridimob: 'BaridiMob',
  cib: 'CIB',
  cash: 'Espèces',
};

const CAUTION_STATUS_STYLES: Record<string, string> = {
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  refunded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export const PaymentsPage = () => {
  const { reservations, payments, clients, vehicles, updatePayment, addPayment } = useAdminStore();
  const { toast } = useToast();

  const handleReleaseCaution = (paymentId: string, reservationId: string) => {
    updatePayment(paymentId, { status: 'refunded', paidAt: new Date().toISOString() });
    toast({ 
      title: 'Caution restituée', 
      description: 'La caution a été marquée comme restituée.' 
    });
  };

  const handleExportPDF = () => {
    window.print();
    toast({ title: 'Export PDF', description: 'La fenêtre d\'impression est ouverte.' });
  };

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

  const totalOutstanding = reservations
    .filter(r => r.status !== 'cancelled' && r.status !== 'completed')
    .reduce((sum, r) => {
      const paid = payments
        .filter(p => p.reservationId === r.id && p.status === 'paid' && p.type !== 'security_deposit')
        .reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, r.totalAmount - paid);
    }, 0);

  // Pending cautions (rental completed but caution not refunded)
  const pendingCautions = payments.filter(p => {
    if (p.type !== 'security_deposit' || p.status !== 'paid') return false;
    const reservation = reservations.find(r => r.id === p.reservationId);
    return reservation?.status === 'completed';
  });

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde en attente</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalOutstanding.toLocaleString()} DA</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending caution alerts */}
      {pendingCautions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="w-5 h-5" />
              Cautions à restituer ({pendingCautions.length})
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-green-500 text-green-700 hover:bg-green-50"
                      onClick={() => handleReleaseCaution(p.id, reservation?.id ?? '')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Restituer
                    </Button>
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
                const remainingBalance = r.totalAmount - r.deposit;

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
                          <p className="text-xs text-orange-500">En attente</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{r.securityDeposit.toLocaleString()} DA</TableCell>
                    <TableCell>
                      {cautionPayment ? (
                        <Badge className={CAUTION_STATUS_STYLES[cautionPayment.status]}>
                          {cautionPayment.status === 'paid' ? 'Bloquée' : 
                           cautionPayment.status === 'refunded' ? 'Restituée' : 'En attente'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">—</Badge>
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
    </div>
  );
};