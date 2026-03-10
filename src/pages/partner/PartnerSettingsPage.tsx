import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePartnerProfile } from '@/hooks/useApi';
import { partnersApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function PartnerSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = usePartnerProfile();
  const profile = data?.data || data;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  // Initialize form when profile loads
  if (profile && !form) {
    setForm({
      displayName: profile.displayName || '',
      description: profile.description || '',
      phone: profile.phone || '',
      whatsapp: profile.whatsapp || '',
      address: profile.address || '',
      bankName: profile.bankName || '',
      bankRib: profile.bankRib || '',
    });
  }

  if (isLoading || !form) {
    return <div className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64" /></div>;
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f: any) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await partnersApi.updateMyProfile(form);
      toast({ title: 'Profil mis à jour' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-primary">Profil partenaire</h1>
        <p className="text-muted-foreground">Gérez vos informations de partenaire</p>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Statut du compte</p>
            <p className="text-sm text-muted-foreground">Type: {profile.type}</p>
          </div>
          <Badge variant={profile.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {profile.status}
          </Badge>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations publiques</CardTitle>
          <CardDescription>Ces informations sont internes à SoummamCar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nom d'affichage</Label>
            <Input value={form.displayName} onChange={update('displayName')} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={update('description')} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={update('phone')} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={update('whatsapp')} />
            </div>
          </div>
          <div>
            <Label>Adresse</Label>
            <Input value={form.address} onChange={update('address')} />
          </div>

          <Separator />

          <CardTitle className="text-base">Informations bancaires</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Banque</Label>
              <Input value={form.bankName} onChange={update('bankName')} />
            </div>
            <div>
              <Label>RIB</Label>
              <Input value={form.bankRib} onChange={update('bankRib')} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader><CardTitle>Statistiques</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Véhicules max:</span> <strong>{profile.maxVehicles}</strong></div>
            <div><span className="text-muted-foreground">Commission:</span> <strong>{(profile.commissionRate * 100).toFixed(0)}%</strong></div>
            <div><span className="text-muted-foreground">Total locations:</span> <strong>{profile.totalRentals}</strong></div>
            <div><span className="text-muted-foreground">Note moyenne:</span> <strong>{profile.averageRating?.toFixed(1) || '—'}</strong></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
