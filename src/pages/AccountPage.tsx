import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { reservationsApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'En attente', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmée', variant: 'default' },
  ACTIVE: { label: 'En cours', variant: 'default' },
  COMPLETED: { label: 'Terminée', variant: 'outline' },
  CANCELLED: { label: 'Annulée', variant: 'destructive' },
};

export default function AccountPage() {
  const { user, logout, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en' | 'ar'>('fr');
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    reservationsApi
      .getMyReservations()
      .then((data) => setReservations(data.data || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      setEditing(false);
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar language={language} setLanguage={setLanguage} onBookNow={() => navigate('/')} />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar — Profile */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mon profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editing ? (
                  <>
                    <input
                      className="w-full border rounded p-2 text-sm"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
                      placeholder="Prénom"
                    />
                    <input
                      className="w-full border rounded p-2 text-sm"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
                      placeholder="Nom"
                    />
                    <input
                      className="w-full border rounded p-2 text-sm"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="Téléphone"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveProfile}>Enregistrer</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-sm text-gray-500">{user?.phone}</p>
                    {user?.isDiaspora && (
                      <Badge variant="secondary">Diaspora — {user.diasporaCountry}</Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Modifier</Button>
                  </>
                )}
                <Separator />
                <Button variant="destructive" size="sm" onClick={logout} className="w-full">
                  Déconnexion
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main — Reservations */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">Mes réservations</h2>
            {loading ? (
              <p className="text-gray-500">Chargement...</p>
            ) : reservations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <p>Aucune réservation pour le moment.</p>
                  <Link to="/#fleet">
                    <Button className="mt-4">Réserver un véhicule</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              reservations.map((r) => {
                const statusInfo = STATUS_LABELS[r.status] || { label: r.status, variant: 'outline' as const };
                return (
                  <Card key={r.id}>
                    <CardContent className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{r.vehicle?.brand} {r.vehicle?.model}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(r.startDate).toLocaleDateString('fr-FR')} →{' '}
                          {new Date(r.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm">Réf : {r.reference}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        <p className="font-bold">{r.totalAmount?.toLocaleString('fr-DZ')} DZD</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
