import { motion } from "framer-motion";
import { Search, FileText, Car, Key } from "lucide-react";

interface HowItWorksSectionProps {
  language: "fr" | "en" | "ar";
}

const translations = {
  fr: {
    title: "Comment ça marche",
    steps: [
      {
        icon: Search,
        title: "Choisissez votre véhicule",
        description: "Consultez notre flotte et vérifiez les disponibilités en ligne",
      },
      {
        icon: FileText,
        title: "Réservez en ligne",
        description: "Remplissez le formulaire et payez vos arrhes via BaridiMob",
      },
      {
        icon: Car,
        title: "Prenez en charge",
        description: "État des lieux photo contradictoire, contrat signé, clés remises",
      },
      {
        icon: Key,
        title: "Restituez sereinement",
        description: "Retour documenté, caution restituée sous 24h",
      },
    ],
  },
  en: {
    title: "How it works",
    steps: [
      {
        icon: Search,
        title: "Choose your vehicle",
        description: "Browse our fleet and check availability online",
      },
      {
        icon: FileText,
        title: "Book online",
        description: "Fill out the form and pay your deposit via BaridiMob",
      },
      {
        icon: Car,
        title: "Pick up",
        description: "Contradictory photo inspection, signed contract, keys handed over",
      },
      {
        icon: Key,
        title: "Return peacefully",
        description: "Documented return, deposit refunded within 24h",
      },
    ],
  },
  ar: {
    title: "كيف يعمل",
    steps: [
      {
        icon: Search,
        title: "اختر مركبتك",
        description: "تصفح أسطولنا وتحقق من التوفر عبر الإنترنت",
      },
      {
        icon: FileText,
        title: "احجز عبر الإنترنت",
        description: "املأ النموذج وادفع العربون عبر بريدي موب",
      },
      {
        icon: Car,
        title: "استلم السيارة",
        description: "فحص بالصور، عقد موقع، استلام المفاتيح",
      },
      {
        icon: Key,
        title: "أعد بهدوء",
        description: "إرجاع موثق، استرداد الكفالة خلال 24 ساعة",
      },
    ],
  },
};

export function HowItWorksSection({ language }: HowItWorksSectionProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <section
      id="how-it-works"
      className="py-20 bg-secondary"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {t.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-amber/10 flex items-center justify-center">
                  <step.icon className="h-10 w-10 text-amber" />
                </div>
                <span className="absolute -top-2 -right-2 md:right-auto md:left-1/2 md:ml-8 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
