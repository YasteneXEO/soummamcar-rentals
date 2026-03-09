import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Bell, Shield } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Paramètres</h1>
        <p className="text-muted-foreground">Configuration de l'agence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Informations agence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de l'agence</Label>
              <Input defaultValue="SoummamCar" className="mt-1" />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input defaultValue="Béjaïa, Algérie" className="mt-1" />
            </div>
            <div>
              <Label>Téléphone / WhatsApp</Label>
              <Input defaultValue="+213 555 000 000" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="contact@soummamcar.dz" className="mt-1" />
            </div>
            <div>
              <Label>RIB BaridiMob</Label>
              <Input defaultValue="00799999123456789012" className="mt-1" />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Paramètres de location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Taux d'arrhes (%)</Label>
              <Input type="number" defaultValue="25" className="mt-1" />
            </div>
            <div>
              <Label>Caution standard (DA)</Label>
              <Input type="number" defaultValue="15000" className="mt-1" />
            </div>
            <div>
              <Label>Délai restitution caution (heures)</Label>
              <Input type="number" defaultValue="24" className="mt-1" />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email administrateur</Label>
              <Input defaultValue="admin@soummamcar.dz" className="mt-1" />
            </div>
            <div>
              <Label>Nouveau mot de passe</Label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <div>
              <Label>Confirmer le mot de passe</Label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <Button>Mettre à jour</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Les alertes automatiques sont activées pour :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Expiration des documents (30 jours avant)</li>
              <li>Révision véhicule (500 km avant)</li>
              <li>Retours en retard</li>
              <li>Cautions en attente de restitution</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};