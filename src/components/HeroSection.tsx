import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '+213XXXXXXXXX';
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, '')}`;

interface HeroSectionProps {
  language: "fr" | "en" | "ar";
  onViewFleet: () => void;
}

const translations = {
  fr: {
    headline: "Louez en toute confiance à Béjaïa",
    subheadline: "Processus transparent, contrats digitaux, flotte vérifiée et entretenue.",
    viewFleet: "Voir nos véhicules",
    whatsapp: "Nous contacter sur WhatsApp",
  },
  en: {
    headline: "Rent with confidence in Béjaïa",
    subheadline: "Transparent process, digital contracts, verified and maintained fleet.",
    viewFleet: "View our vehicles",
    whatsapp: "Contact us on WhatsApp",
  },
  ar: {
    headline: "استأجر بثقة في بجاية",
    subheadline: "عملية شفافة، عقود رقمية، أسطول موثق ومصان.",
    viewFleet: "شاهد مركباتنا",
    whatsapp: "تواصل معنا عبر واتساب",
  },
};

export function HeroSection({ language, onViewFleet }: HeroSectionProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-16"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Car rental in Béjaïa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight"
          >
            {t.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-8"
          >
            {t.subheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={onViewFleet}
              size="lg"
              className="bg-amber hover:bg-amber-hover text-amber-foreground font-semibold text-lg px-8"
            >
              {t.viewFleet}
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-navy font-semibold text-lg px-8"
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                {t.whatsapp}
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
