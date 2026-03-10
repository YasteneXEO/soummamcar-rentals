import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>

        {/* FRANÇAIS */}
        <section className="mb-16">
          <h1 className="text-3xl font-display font-bold mb-6">
            Conditions Générales de Location
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Dernière mise à jour : mars 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. Objet</h2>
            <p>
              Les présentes conditions générales régissent la location de
              véhicules proposée par SoummamCar, société de location de
              véhicules basée à Béjaïa, Algérie. Toute réservation implique
              l'acceptation pleine et entière des présentes conditions.
            </p>

            <h2 className="text-xl font-semibold">2. Conditions de location</h2>
            <p>
              Le locataire doit être âgé d'au moins 21 ans, être titulaire d'un
              permis de conduire valide depuis au moins 2 ans et présenter une
              pièce d'identité nationale ou un passeport en cours de validité.
              Pour les clients de la diaspora, un permis de conduire étranger
              valide (accompagné d'un permis international si nécessaire) est
              accepté.
            </p>

            <h2 className="text-xl font-semibold">3. Réservation et paiement</h2>
            <p>
              La réservation est confirmée après le versement d'arrhes de 25 %
              du montant total de la location. Le solde est dû à la prise en
              charge du véhicule. Une caution (variable selon le véhicule) est
              exigée et restituée intégralement à la restitution du véhicule en
              bon état.
            </p>

            <h2 className="text-xl font-semibold">4. Annulation</h2>
            <p>
              Toute annulation effectuée plus de 48 heures avant la date de
              prise en charge donne lieu au remboursement intégral des arrhes.
              En deçà de 48 heures, les arrhes sont retenues.
            </p>

            <h2 className="text-xl font-semibold">5. Utilisation du véhicule</h2>
            <p>
              Le véhicule doit être utilisé conformément au code de la route
              algérien. Il est interdit de sous-louer le véhicule, de
              l'utiliser pour des courses, ou de le conduire en état d'ivresse.
              Le locataire est responsable de toutes les infractions commises
              pendant la durée de la location.
            </p>

            <h2 className="text-xl font-semibold">6. Assurance</h2>
            <p>
              Le véhicule est assuré tous risques avec franchise. Une option
              d'assurance zéro franchise est disponible en supplément. En cas
              de sinistre, le locataire doit prévenir SoummamCar immédiatement
              et remplir un constat amiable.
            </p>

            <h2 className="text-xl font-semibold">7. Restitution</h2>
            <p>
              Le véhicule doit être restitué à la date et au lieu convenus,
              dans le même état qu'à la prise en charge. Tout retard non
              signalé entraîne une facturation supplémentaire. Le niveau de
              carburant doit être identique à celui de la prise en charge.
            </p>

            <h2 className="text-xl font-semibold">8. Litiges</h2>
            <p>
              En cas de litige, les parties s'engagent à rechercher une
              solution amiable. À défaut, les tribunaux de Béjaïa sont
              compétents.
            </p>
          </div>
        </section>

        {/* ENGLISH */}
        <section className="mb-16 border-t pt-12">
          <h1 className="text-3xl font-display font-bold mb-6">
            General Rental Terms & Conditions
          </h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. Purpose</h2>
            <p>
              These general terms and conditions govern the vehicle rental
              services offered by SoummamCar, a car rental company based in
              Béjaïa, Algeria. Any reservation implies full acceptance of these
              terms.
            </p>

            <h2 className="text-xl font-semibold">2. Rental requirements</h2>
            <p>
              The renter must be at least 21 years old, hold a valid driving
              license for at least 2 years, and present a valid national ID
              card or passport. For diaspora clients, a valid foreign driving
              license (with international permit if required) is accepted.
            </p>

            <h2 className="text-xl font-semibold">3. Reservation & payment</h2>
            <p>
              A reservation is confirmed upon payment of a 25% deposit. The
              balance is due at vehicle pickup. A security deposit (variable
              per vehicle) is required and fully refunded upon return of the
              vehicle in good condition.
            </p>

            <h2 className="text-xl font-semibold">4. Cancellation</h2>
            <p>
              Cancellations made more than 48 hours before pickup are fully
              refunded. Cancellations within 48 hours forfeit the deposit.
            </p>

            <h2 className="text-xl font-semibold">5. Vehicle use</h2>
            <p>
              The vehicle must be used in accordance with Algerian traffic
              regulations. Sub-renting, racing, or driving under the influence
              is strictly prohibited.
            </p>

            <h2 className="text-xl font-semibold">6. Insurance</h2>
            <p>
              Vehicles are insured with deductible. A zero-deductible insurance
              option is available as an extra. In case of an accident, the
              renter must notify SoummamCar immediately.
            </p>

            <h2 className="text-xl font-semibold">7. Vehicle return</h2>
            <p>
              The vehicle must be returned at the agreed date, time, and
              location, in the same condition as at pickup. Late returns incur
              additional charges. Fuel level must match the pickup level.
            </p>
          </div>
        </section>

        {/* ARABIC */}
        <section className="border-t pt-12" dir="rtl">
          <h1 className="text-3xl font-display font-bold mb-6">
            الشروط العامة للإيجار
          </h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. الغرض</h2>
            <p>
              تحكم هذه الشروط العامة خدمات تأجير المركبات التي تقدمها صومام كار،
              شركة تأجير سيارات مقرها بجاية، الجزائر. أي حجز يعني القبول الكامل
              لهذه الشروط.
            </p>

            <h2 className="text-xl font-semibold">2. شروط الإيجار</h2>
            <p>
              يجب أن يكون المستأجر قد بلغ 21 عامًا على الأقل، وأن يحمل رخصة
              قيادة سارية منذ عامين على الأقل، وأن يقدم بطاقة هوية وطنية أو
              جواز سفر ساري المفعول. بالنسبة لعملاء المهجر، يُقبل رخصة القيادة
              الأجنبية السارية.
            </p>

            <h2 className="text-xl font-semibold">3. الحجز والدفع</h2>
            <p>
              يتم تأكيد الحجز بعد دفع عربون بنسبة 25٪ من المبلغ الإجمالي.
              يستحق الرصيد عند استلام المركبة. يُطلب تأمين (متغير حسب المركبة)
              يُرد بالكامل عند إرجاع المركبة بحالة جيدة.
            </p>

            <h2 className="text-xl font-semibold">4. الإلغاء</h2>
            <p>
              الإلغاء قبل 48 ساعة من موعد الاستلام يُرد فيه العربون بالكامل.
              الإلغاء في أقل من 48 ساعة يُصادر العربون.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
