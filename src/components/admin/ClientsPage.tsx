import { useState } from 'react';
import { useAdminStore, Client } from '@/store/adminStore';
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
import { Search, Star, User, Phone, Mail, MapPin, Hash } from 'lucide-react';

const CLIENT_STATUS_STYLES: Record<string, string> = {
  reliable: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  monitor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  blacklisted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const CLIENT_STATUS_LABELS: Record<string, string> = {
  reliable: 'Fiable',
  monitor: 'À surveiller',
  blacklisted: 'Blacklisté',
};

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} ${onChange ? 'cursor-pointer hover:text-amber-400' : ''}`}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}

function ClientDetailModal({ client, open, onClose }: {
  client: Client | null;
  open: boolean;
  onClose: () => void;
}) {
  const { updateClient, reservations, vehicles } = useAdminStore();
  const { toast } = useToast();
  const [notes, setNotes] = useState(client?.internalNotes ?? '');

  if (!client) return null;

  const clientReservations = reservations.filter(r => r.clientId === client.id);
  const totalSpent = clientReservations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const handleSaveNotes = () => {
    updateClient(client.id, { internalNotes: notes });
    toast({ title: 'Notes sauvegardées' });
  };

  const handleStatusChange = (status: Client['status']) => {
    updateClient(client.id, { status });
    toast({ title: 'Statut mis à jour' });
  };

  const handleRatingChange = (rating: number) => {
    updateClient(client.id, { rating: rating as 1|2|3|4|5 });
    toast({ title: 'Note mise à jour' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-5 h-5" />
            {client.fullName}
            <Badge className={CLIENT_STATUS_STYLES[client.status]}>
              {CLIENT_STATUS_LABELS[client.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{client.wilaya}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">{client.idNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Permis: {client.licenseNumber}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Note client</Label>
                <StarRating rating={client.rating} onChange={handleRatingChange} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Statut</Label>
                <Select value={client.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIENT_STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-xl font-bold text-primary">{client.totalRentals}</div>
                  <div className="text-xs text-muted-foreground">Locations</div>
                </div>
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-sm font-bold text-primary">{totalSpent.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">DA dépensés</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental history */}
          <div>
            <h3 className="font-semibold mb-3">Historique des locations</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf#</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientReservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Aucune location
                    </TableCell>
                  </TableRow>
                )}
                {clientReservations.map(r => {
                  const vehicle = vehicles.find(v => v.id === r.vehicleId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.referenceNumber}</TableCell>
                      <TableCell>{vehicle?.name ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.pickupDate).toLocaleDateString('fr-FR')} → {new Date(r.returnDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{r.totalAmount.toLocaleString()} DA</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Internal notes */}
          <div>
            <Label>Notes internes (privé)</Label>
            <Textarea
              className="mt-1"
              placeholder="Notes confidentielles sur ce client..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleSaveNotes}>Sauvegarder les notes</Button>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ClientsPage = () => {
  const { clients, reservations } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = clients.filter(c => {
    const matchSearch = search === '' ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.wilaya.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openDetail = (c: Client) => {
    setSelectedClient(c);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Clients (CRM)</h1>
          <p className="text-muted-foreground">Base de données clients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, téléphone, wilaya..."
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
            <SelectItem value="all">Tous les clients</SelectItem>
            {Object.entries(CLIENT_STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clients table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Wilaya</TableHead>
                <TableHead>Nb locations</TableHead>
                <TableHead>Dernière location</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(c => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-secondary/30" onClick={() => openDetail(c)}>
                  <TableCell className="font-semibold">{c.fullName}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.wilaya}</TableCell>
                  <TableCell className="text-center">{c.totalRentals}</TableCell>
                  <TableCell>{c.lastRental ? new Date(c.lastRental).toLocaleDateString('fr-FR') : '—'}</TableCell>
                  <TableCell>
                    <StarRating rating={c.rating} />
                  </TableCell>
                  <TableCell>
                    <Badge className={CLIENT_STATUS_STYLES[c.status]}>
                      {CLIENT_STATUS_LABELS[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => openDetail(c)}>
                      Voir profil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientDetailModal
        client={selectedClient}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};