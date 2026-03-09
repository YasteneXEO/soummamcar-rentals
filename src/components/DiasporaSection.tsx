import { motion } from "framer-motion";
import { Plane, CreditCard, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiasporaSectionProps {
  language: "fr" | "en" | "ar";
  onBookFromAbroad: () => void;
}

const translations = {
  fr: {
    title: "Vous rentrez en Algérie cet été ?",
    description:
      "Réservation depuis l'étranger, livraison à l'aéroport Soummam, paiement carte internationale, contrat pré-signé avant l'arrivée.",
    features: [
      "Livraison à l'aéroport",
      "Paiement carte internationale",
      "Contrat pré-signé",
    ],
    cta: "Réserver depuis l'étranger",
  },
  en: {
    title: "Returning to Algeria this summer?",
    description:
      "Book from abroad, airport delivery at Soummam, international card payment, pre-signed contract before arrival.",
    features: [
      "Airport delivery",
      "International card payment",
      "Pre-signed contract",
    ],
    cta: "Book from abroad",
  },
  ar: {
    title: "هل تعود إلى الجزائر هذا الصيف؟",
    description:
      "حجز من الخارج، توصيل في مطار الصومام، دفع ببطاقة دولية، عقد موقع مسبقاً قبل الوصول.",
    features: ["توصيل في المطار", "دفع ببطاقة دولية", "عقد موقع مسبقاً"],
    cta: "احجز من الخارج",
  },
};

export function DiasporaSection({ language, onBookFromAbroad }: DiasporaSectionProps) {
  const t = translations[language];
  const isRTL = language === "ar";
  const icons = [Plane, CreditCard, FileCheck];

  return (
    <section className="py-16 bg-amber" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-amber-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-amber-foreground/90 mb-8 max-w-2xl mx-auto">
            {t.description}
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {t.features.map((feature, index) => {
              const Icon = icons[index];
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-amber-foreground"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{feature}</span>
                </div>
              );
            })}
          </div>
          <Button
            onClick={onBookFromAbroad}
            size="lg"
            className="bg-navy hover:bg-navy-light text-white font-semibold text-lg px-8"
          >
            {t.cta}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
