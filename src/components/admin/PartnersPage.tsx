import { useState } from 'react';
import { Building2, User, Eye, Check, X, TrendingUp, Star, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAdminPartners } from '@/hooks/useApi';
import { partnersApi } from '@/services/api';

const STATUS_STYLES: Record<string, string> = {
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export function PartnersPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const { data, isLoading, refetch } = useAdminPartners(filter ? { status: filter } : undefined);
  const partners = data?.data || data || [];

  const [detailModal, setDetailModal] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState('');
  const [maxVehicles, setMaxVehicles] = useState(0);

  const openDetail = (partner: any) => {
    setDetailModal(partner);
    setAdminStatus(partner.status);
    setMaxVehicles(partner.maxVehicles);
  };

  const handleAdminUpdate = async () => {
    if (!detailModal) return;
    try {
      await partnersApi.adminUpdate(detailModal.id, {
        status: adminStatus,
        maxVehicles,
      });
      toast({ title: 'Partenaire mis à jour' });
      setDetailModal(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  // Stats
  const totalActive = partners.filter((p: any) => p.status === 'ACTIVE').length;
  const totalPending = partners.filter((p: any) => p.status === 'PENDING_REVIEW').length;
  const totalVehiclesAll = partners.reduce((s: number, p: any) => s + (p.totalVehicles || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des partenaires</h1>
          <p className="text-muted-foreground">{partners.length} partenaire(s)</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="PENDING_REVIEW">En attente</SelectItem>
            <SelectItem value="ACTIVE">Actifs</SelectItem>
            <SelectItem value="SUSPENDED">Suspendus</SelectItem>
            <SelectItem value="REJECTED">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total partenaires</div>
            <div className="text-2xl font-bold">{partners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Actifs</div>
            <div className="text-2xl font-bold text-green-600">{totalActive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">En attente</div>
            <div className="text-2xl font-bold text-amber-600">{totalPending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Véhicules partenaires</div>
            <div className="text-2xl font-bold">{totalVehiclesAll}</div>
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
                <TableHead>Type</TableHead>
                <TableHead>Wilaya</TableHead>
                <TableHead>Véhicules</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun partenaire.
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.type === 'AGENCY' ? <Building2 className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-amber" />}
                        <div>
                          <p className="font-medium">{p.displayName}</p>
                          <p className="text-xs text-muted-foreground">{p.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.type === 'AGENCY' ? 'Agence' : 'Particulier'}</Badge>
                    </TableCell>
                    <TableCell>{p.wilaya}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Car className="h-4 w-4" /> {p.totalVehicles}/{p.maxVehicles}
                    </TableCell>
                    <TableCell>
                      {p.averageRating > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber text-amber" /> {p.averageRating.toFixed(1)}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[p.status] || 'bg-gray-100'}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openDetail(p)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailModal?.displayName}</DialogTitle>
          </DialogHeader>
          {detailModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Type:</span> {detailModal.type}</div>
                <div><span className="text-muted-foreground">Wilaya:</span> {detailModal.wilaya}, {detailModal.city}</div>
                <div><span className="text-muted-foreground">Tél:</span> {detailModal.phone}</div>
                <div><span className="text-muted-foreground">WhatsApp:</span> {detailModal.whatsapp || '—'}</div>
                <div><span className="text-muted-foreground">Commission:</span> {(detailModal.commissionRate * 100).toFixed(0)}%</div>
                <div><span className="text-muted-foreground">Locations:</span> {detailModal.totalRentals}</div>
                {detailModal.registreCommerce && (
                  <div><span className="text-muted-foreground">RC:</span> {detailModal.registreCommerce}</div>
                )}
                {detailModal.nif && (
                  <div><span className="text-muted-foreground">NIF:</span> {detailModal.nif}</div>
                )}
              </div>

              <div>
                <Label>Statut</Label>
                <Select value={adminStatus} onValueChange={setAdminStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING_REVIEW">En attente</SelectItem>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    <SelectItem value="REJECTED">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Véhicules max</Label>
                <Input type="number" value={maxVehicles} onChange={(e) => setMaxVehicles(+e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModal(null)}>Fermer</Button>
            <Button onClick={handleAdminUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
