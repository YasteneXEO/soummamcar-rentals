import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalPage() {
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
            Mentions Légales
          </h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">Éditeur du site</h2>
            <ul className="list-none space-y-2">
              <li><strong>Raison sociale :</strong> SoummamCar</li>
              <li><strong>Forme juridique :</strong> EURL / SARL (à préciser)</li>
              <li><strong>Registre de commerce :</strong> RC N° XX-XXXX (Béjaïa)</li>
              <li><strong>NIF :</strong> XXXXXXXXXXXXXXXXX</li>
              <li><strong>Siège social :</strong> Béjaïa, Algérie</li>
              <li><strong>Responsable de la publication :</strong> [Nom du gérant]</li>
              <li><strong>Email :</strong> contact@soummamcar.com</li>
              <li><strong>Téléphone :</strong> {import.meta.env.VITE_WHATSAPP_NUMBER || '+213 XXX XXX XXX'}</li>
            </ul>

            <h2 className="text-xl font-semibold">Hébergement</h2>
            <p>
              Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
              CA 91789, États-Unis. Le backend est hébergé sur un serveur VPS en
              France (OVH / Scaleway).
            </p>

            <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, logos, design)
              est la propriété exclusive de SoummamCar. Toute reproduction, même
              partielle, est interdite sans autorisation écrite préalable.
            </p>

            <h2 className="text-xl font-semibold">Responsabilité</h2>
            <p>
              SoummamCar s'efforce d'assurer l'exactitude des informations
              publiées sur ce site. Toutefois, SoummamCar ne saurait être tenu
              responsable des erreurs, omissions ou des résultats qui pourraient
              être obtenus par un mauvais usage de ces informations.
            </p>
          </div>
        </section>

        {/* ENGLISH */}
        <section className="mb-16 border-t pt-12">
          <h1 className="text-3xl font-display font-bold mb-6">Legal Notices</h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">Site publisher</h2>
            <ul className="list-none space-y-2">
              <li><strong>Company name:</strong> SoummamCar</li>
              <li><strong>Legal form:</strong> EURL / SARL (to be specified)</li>
              <li><strong>Trade register:</strong> RC N° XX-XXXX (Béjaïa)</li>
              <li><strong>Registered office:</strong> Béjaïa, Algeria</li>
              <li><strong>Publication director:</strong> [Manager name]</li>
              <li><strong>Email:</strong> contact@soummamcar.com</li>
            </ul>

            <h2 className="text-xl font-semibold">Hosting</h2>
            <p>
              This site is hosted by Vercel Inc. The backend is hosted on a VPS
              server in France (OVH / Scaleway).
            </p>

            <h2 className="text-xl font-semibold">Intellectual property</h2>
            <p>
              All content on this site (text, images, logos, design) is the
              exclusive property of SoummamCar. Any reproduction without prior
              written authorization is prohibited.
            </p>
          </div>
        </section>

        {/* ARABIC */}
        <section className="border-t pt-12" dir="rtl">
          <h1 className="text-3xl font-display font-bold mb-6">
            الإشعارات القانونية
          </h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">ناشر الموقع</h2>
            <ul className="list-none space-y-2">
              <li><strong>الاسم التجاري:</strong> صومام كار</li>
              <li><strong>السجل التجاري:</strong> RC N° XX-XXXX (بجاية)</li>
              <li><strong>المقر الاجتماعي:</strong> بجاية، الجزائر</li>
              <li><strong>البريد الإلكتروني:</strong> contact@soummamcar.com</li>
            </ul>

            <h2 className="text-xl font-semibold">الملكية الفكرية</h2>
            <p>
              جميع محتويات هذا الموقع هي ملك حصري لصومام كار. يُحظر أي نسخ
              بدون إذن كتابي مسبق.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
