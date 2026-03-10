import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram } from "lucide-react";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '+213XXXXXXXXX';
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, '')}`;
const phoneDisplay = WHATSAPP_NUMBER;

interface FooterProps {
  language: "fr" | "en" | "ar";
}

const translations = {
  fr: {
    address: "Béjaïa, Algérie",
    email: "contact@soummamcar.com",
    whatsapp: "WhatsApp",
    legal: "Mentions légales",
    privacy: "Politique de confidentialité",
    copyright: "© 2025 SoummamCar. Tous droits réservés.",
  },
  en: {
    address: "Béjaïa, Algeria",
    email: "contact@soummamcar.com",
    whatsapp: "WhatsApp",
    legal: "Legal notices",
    privacy: "Privacy policy",
    copyright: "© 2025 SoummamCar. All rights reserved.",
  },
  ar: {
    address: "بجاية، الجزائر",
    email: "contact@soummamcar.com",
    whatsapp: "واتساب",
    legal: "الإشعارات القانونية",
    privacy: "سياسة الخصوصية",
    copyright: "© 2025 صومام كار. جميع الحقوق محفوظة.",
  },
};

export function Footer({ language }: FooterProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <footer
      id="contact"
      className="bg-navy text-white py-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <span className="text-2xl font-display font-bold">
              Soummam<span className="text-amber">Car</span>
            </span>
            <p className="mt-4 text-white/70">
              {language === "ar"
                ? "خدمة تأجير سيارات موثوقة في بجاية"
                : language === "en"
                ? "Reliable car rental service in Béjaïa"
                : "Service de location de voitures fiable à Béjaïa"}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-amber" />
              <span>{t.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-amber" />
              <a href={`tel:${WHATSAPP_NUMBER.replace(/\s/g, '')}`} className="hover:text-amber transition-colors">
                {phoneDisplay}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-amber" />
              <a
                href="mailto:contact@soummamcar.com"
                className="hover:text-amber transition-colors"
              >
                {t.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-amber" />
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber transition-colors"
              >
                {t.whatsapp}
              </a>
            </div>
          </div>

          {/* Social & Links */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2">
              <a href="/legal" className="block text-white/70 hover:text-white transition-colors">
                {t.legal}
              </a>
              <a href="/privacy" className="block text-white/70 hover:text-white transition-colors">
                {t.privacy}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-white/60">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
}
