import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, UserCircle, ArrowRight, Shield, DollarSign, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { partnersApi, setTokens } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type Step = 'type' | 'info' | 'done';

export default function PartnerRegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const loadUser = useAuthStore((s) => s.loadUser);
  const [language, setLanguage] = useState<'fr' | 'en' | 'ar'>('fr');
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: '' as 'AGENCY' | 'INDIVIDUAL' | '',
    // User info
    fullName: '',
    email: '',
    phone: '',
    password: '',
    // Partner info
    displayName: '',
    wilaya: '',
    city: '',
    registreCommerce: '',
    nif: '',
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await partnersApi.register({
        type: form.type,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        displayName: form.displayName,
        wilaya: form.wilaya,
        city: form.city,
        registreCommerce: form.type === 'AGENCY' ? form.registreCommerce : undefined,
        nif: form.type === 'AGENCY' ? form.nif : undefined,
      });
      // If API returns tokens, set them
      if (res.tokens) {
        setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        await loadUser();
      }
      setStep('done');
      toast({ title: 'Inscription réussie !', description: 'Votre demande de partenariat est en cours de validation.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar language={language} setLanguage={setLanguage} onBookNow={() => {}} />
      <main className="flex-1 mt-20 container mx-auto px-4 py-8">
        {step === 'type' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary">Devenir partenaire SoummamCar</h1>
              <p className="text-muted-foreground mt-2">
                Proposez vos véhicules sur la plateforme SoummamCar et générez des revenus supplémentaires.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="text-center p-6">
                <Shield className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold">Vérification complète</h3>
                <p className="text-sm text-muted-foreground mt-1">Processus en 6 étapes pour garantir la qualité</p>
              </Card>
              <Card className="text-center p-6">
                <DollarSign className="h-10 w-10 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold">Revenus garantis</h3>
                <p className="text-sm text-muted-foreground mt-1">Paiement sous 48h après chaque location</p>
              </Card>
              <Card className="text-center p-6">
                <Car className="h-10 w-10 mx-auto mb-3 text-amber" />
                <h3 className="font-semibold">Gestion simplifiée</h3>
                <p className="text-sm text-muted-foreground mt-1">SoummamCar s'occupe de tout face au client</p>
              </Card>
            </div>

            <h2 className="text-xl font-semibold text-center">Choisissez votre profil</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${form.type === 'AGENCY' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => update('type', 'AGENCY')}
              >
                <CardContent className="py-8 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold">Agence</h3>
                  <p className="text-muted-foreground mt-2">
                    Vous êtes une agence de location avec un registre de commerce
                  </p>
                  <Badge className="mt-3">Commission: 15%</Badge>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${form.type === 'INDIVIDUAL' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => update('type', 'INDIVIDUAL')}
              >
                <CardContent className="py-8 text-center">
                  <UserCircle className="h-12 w-12 mx-auto mb-4 text-amber" />
                  <h3 className="text-xl font-bold">Particulier</h3>
                  <p className="text-muted-foreground mt-2">
                    Vous êtes un particulier souhaitant mettre votre véhicule en location
                  </p>
                  <Badge className="mt-3">Commission: 20%</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                disabled={!form.type}
                onClick={() => setStep('info')}
                className="gap-2"
              >
                Continuer <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'info' && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Créer votre compte partenaire</CardTitle>
              <CardDescription>
                {form.type === 'AGENCY' ? 'Inscription agence' : 'Inscription particulier'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom complet</Label>
                <Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+213" />
              </div>
              <div>
                <Label>Mot de passe</Label>
                <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} />
              </div>
              <div>
                <Label>Nom d'affichage (entreprise ou surnom)</Label>
                <Input value={form.displayName} onChange={(e) => update('displayName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Wilaya</Label>
                  <Input value={form.wilaya} onChange={(e) => update('wilaya', e.target.value)} />
                </div>
                <div>
                  <Label>Ville</Label>
                  <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
              </div>

              {form.type === 'AGENCY' && (
                <>
                  <div>
                    <Label>Registre de commerce</Label>
                    <Input value={form.registreCommerce} onChange={(e) => update('registreCommerce', e.target.value)} />
                  </div>
                  <div>
                    <Label>NIF</Label>
                    <Input value={form.nif} onChange={(e) => update('nif', e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('type')}>Retour</Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Inscription…' : "S'inscrire"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Inscription envoyée !</h2>
            <p className="text-muted-foreground mb-8">
              Votre demande est en cours de validation. Vous recevrez un email une fois votre compte activé.
              En attendant, vous pouvez accéder à votre espace partenaire.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/partner/dashboard">
                <Button size="lg">Accéder à mon espace</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg">Retour à l'accueil</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer language={language} />
    </div>
  );
}
