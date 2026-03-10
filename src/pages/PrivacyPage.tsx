import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Dernière mise à jour : mars 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. Responsable du traitement</h2>
            <p>
              SoummamCar, société de location de véhicules basée à Béjaïa,
              Algérie, est responsable du traitement de vos données
              personnelles.
            </p>

            <h2 className="text-xl font-semibold">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nom complet, adresse email, numéro de téléphone</li>
              <li>Numéro de pièce d'identité (CNI ou passeport)</li>
              <li>Numéro de permis de conduire</li>
              <li>Pays de résidence (pour les clients de la diaspora)</li>
              <li>Informations de paiement (traitées par nos partenaires sécurisés)</li>
              <li>Photos d'état des lieux des véhicules</li>
            </ul>

            <h2 className="text-xl font-semibold">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gérer votre réservation et votre contrat de location</li>
              <li>Vous contacter par email, SMS ou WhatsApp</li>
              <li>Établir les contrats de location et les factures</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2 className="text-xl font-semibold">4. Partage des données</h2>
            <p>
              Vos données ne sont jamais vendues. Elles peuvent être partagées
              avec nos partenaires de paiement (SATIM, Stripe) et nos
              prestataires techniques dans les limites strictement nécessaires
              à la fourniture du service.
            </p>

            <h2 className="text-xl font-semibold">5. Durée de conservation</h2>
            <p>
              Les données de réservation sont conservées pendant 5 ans
              conformément à la réglementation algérienne. Les données de
              paiement sont conservées selon les obligations fiscales en
              vigueur.
            </p>

            <h2 className="text-xl font-semibold">6. Vos droits</h2>
            <p>
              Vous disposez d'un droit d'accès, de rectification et de
              suppression de vos données. Pour exercer ces droits, contactez-nous
              à l'adresse : contact@soummamcar.com
            </p>

            <h2 className="text-xl font-semibold">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et
              organisationnelles pour protéger vos données : chiffrement,
              accès restreint, sauvegardes régulières.
            </p>
          </div>
        </section>

        {/* ENGLISH */}
        <section className="mb-16 border-t pt-12">
          <h1 className="text-3xl font-display font-bold mb-6">Privacy Policy</h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. Data controller</h2>
            <p>
              SoummamCar, a vehicle rental company based in Béjaïa, Algeria, is
              responsible for the processing of your personal data.
            </p>

            <h2 className="text-xl font-semibold">2. Data collected</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name, email address, phone number</li>
              <li>ID number (national ID or passport)</li>
              <li>Driving license number</li>
              <li>Country of residence (for diaspora clients)</li>
              <li>Payment information (processed by secure partners)</li>
              <li>Vehicle condition report photos</li>
            </ul>

            <h2 className="text-xl font-semibold">3. Purpose</h2>
            <p>
              Your data is used to manage reservations, contracts, invoices,
              and to contact you via email, SMS, or WhatsApp. We do not sell
              your data.
            </p>

            <h2 className="text-xl font-semibold">4. Your rights</h2>
            <p>
              You have the right to access, modify, and delete your personal
              data. Contact us at: contact@soummamcar.com
            </p>
          </div>
        </section>

        {/* ARABIC */}
        <section className="border-t pt-12" dir="rtl">
          <h1 className="text-3xl font-display font-bold mb-6">
            سياسة الخصوصية
          </h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. المسؤول عن المعالجة</h2>
            <p>
              صومام كار، شركة تأجير مركبات مقرها بجاية، الجزائر، هي المسؤولة
              عن معالجة بياناتك الشخصية.
            </p>

            <h2 className="text-xl font-semibold">2. البيانات المجمعة</h2>
            <ul className="list-disc pr-6 space-y-1">
              <li>الاسم الكامل، البريد الإلكتروني، رقم الهاتف</li>
              <li>رقم الهوية الوطنية أو جواز السفر</li>
              <li>رقم رخصة القيادة</li>
              <li>بلد الإقامة (لعملاء المهجر)</li>
            </ul>

            <h2 className="text-xl font-semibold">3. حقوقك</h2>
            <p>
              لديك الحق في الوصول إلى بياناتك وتعديلها وحذفها. تواصل معنا عبر:
              contact@soummamcar.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
