import { motion } from "framer-motion";
import { ShieldCheck, Camera, Clock } from "lucide-react";

interface TrustSectionProps {
  language: "fr" | "en" | "ar";
}

const translations = {
  fr: {
    items: [
      {
        icon: ShieldCheck,
        title: "Contrat digital signé",
        description: "Protection juridique complète avec signature électronique",
      },
      {
        icon: Camera,
        title: "État des lieux photo horodaté",
        description: "Documentation complète avant et après la location",
      },
      {
        icon: Clock,
        title: "Caution restituée sous 24h",
        description: "Remboursement rapide et garanti de votre caution",
      },
    ],
  },
  en: {
    items: [
      {
        icon: ShieldCheck,
        title: "Signed digital contract",
        description: "Complete legal protection with electronic signature",
      },
      {
        icon: Camera,
        title: "Timestamped photo inspection",
        description: "Complete documentation before and after rental",
      },
      {
        icon: Clock,
        title: "Deposit refunded within 24h",
        description: "Fast and guaranteed refund of your deposit",
      },
    ],
  },
  ar: {
    items: [
      {
        icon: ShieldCheck,
        title: "عقد رقمي موقع",
        description: "حماية قانونية كاملة مع التوقيع الإلكتروني",
      },
      {
        icon: Camera,
        title: "فحص بالصور مؤرخ",
        description: "توثيق كامل قبل وبعد الإيجار",
      },
      {
        icon: Clock,
        title: "استرداد الكفالة خلال 24 ساعة",
        description: "استرداد سريع ومضمون لكفالتك",
      },
    ],
  },
};

export function TrustSection({ language }: TrustSectionProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <section className="py-16 bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-trust-blue/10 flex items-center justify-center">
                <item.icon className="h-7 w-7 text-trust-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
