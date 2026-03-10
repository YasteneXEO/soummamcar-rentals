import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, Banknote, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type PaymentMethod = 'cib' | 'stripe' | null;

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'fr' | 'en' | 'ar'>('fr');
  const reservationId = searchParams.get('reservation');
  const amount = Number(searchParams.get('amount') || 0);
  const isDiaspora = searchParams.get('diaspora') === 'true';
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);

  if (!reservationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Aucune réservation spécifiée.</p>
      </div>
    );
  }

  const handlePay = async () => {
    if (!method) return;
    setLoading(true);
    try {
      if (method === 'cib') {
        const { redirectUrl } = await paymentsApi.initiateCib({
          reservationId,
          type: 'DEPOSIT',
          amount,
        });
        window.location.href = redirectUrl;
      } else if (method === 'stripe') {
        const { checkoutUrl } = await paymentsApi.initiateStripe({
          reservationId,
          type: 'DEPOSIT',
          amount,
          currency: 'EUR',
        });
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      alert(error.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar language={language} setLanguage={setLanguage} onBookNow={() => navigate('/')} />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Paiement des arrhes</CardTitle>
            <CardDescription>
              Montant à régler : <strong>{amount.toLocaleString('fr-DZ')} DZD</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CIB/Edahabia — Algerian clients */}
            <button
              onClick={() => setMethod('cib')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                method === 'cib' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">Carte CIB / Edahabia</p>
                  <p className="text-sm text-muted-foreground">Paiement via SATIM — Algérie</p>
                </div>
                {method === 'cib' && <Badge className="ml-auto">Sélectionné</Badge>}
              </div>
            </button>

            {/* Stripe — Diaspora */}
            <button
              onClick={() => setMethod('stripe')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                method === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Carte internationale (Visa/MC)</p>
                  <p className="text-sm text-muted-foreground">Paiement sécurisé via Stripe — Diaspora</p>
                </div>
                {method === 'stripe' && <Badge className="ml-auto">Sélectionné</Badge>}
              </div>
            </button>

            {/* Bank transfer info */}
            <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <Banknote className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium text-sm">Virement bancaire</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Vous pouvez aussi effectuer un virement. Envoyez le justificatif par WhatsApp pour validation rapide.
              </p>
              <p className="text-xs mt-1 font-mono text-muted-foreground">
                RIB: 00799999004045678900148
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!method || loading}
              onClick={handlePay}
            >
              {loading ? 'Traitement...' : (
                <>Payer maintenant <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer language={language} />
    </div>
  );
}
