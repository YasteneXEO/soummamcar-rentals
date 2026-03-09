import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialsSectionProps {
  language: "fr" | "en" | "ar";
}

const translations = {
  fr: {
    title: "Ce que disent nos clients",
    testimonials: [
      {
        name: "Karim B.",
        rating: 5,
        comment:
          "Service impeccable ! La voiture était parfaite et le processus de location très transparent. Je recommande vivement.",
      },
      {
        name: "Sarah M.",
        rating: 5,
        comment:
          "J'ai loué depuis la France, livraison à l'aéroport parfaite. Tout était prêt à mon arrivée, super expérience !",
      },
      {
        name: "Yacine T.",
        rating: 5,
        comment:
          "Le système de photos avant/après m'a vraiment rassuré. Caution récupérée en moins de 24h comme promis.",
      },
    ],
  },
  en: {
    title: "What our clients say",
    testimonials: [
      {
        name: "Karim B.",
        rating: 5,
        comment:
          "Impeccable service! The car was perfect and the rental process very transparent. Highly recommend.",
      },
      {
        name: "Sarah M.",
        rating: 5,
        comment:
          "I booked from France, perfect airport delivery. Everything was ready on arrival, great experience!",
      },
      {
        name: "Yacine T.",
        rating: 5,
        comment:
          "The before/after photo system really reassured me. Deposit recovered in less than 24h as promised.",
      },
    ],
  },
  ar: {
    title: "ماذا يقول عملاؤنا",
    testimonials: [
      {
        name: "كريم ب.",
        rating: 5,
        comment:
          "خدمة لا تشوبها شائبة! السيارة كانت مثالية وعملية الإيجار شفافة جداً. أوصي بشدة.",
      },
      {
        name: "سارة م.",
        rating: 5,
        comment:
          "حجزت من فرنسا، توصيل مثالي في المطار. كل شيء كان جاهزاً عند وصولي، تجربة رائعة!",
      },
      {
        name: "ياسين ت.",
        rating: 5,
        comment:
          "نظام الصور قبل/بعد طمأنني حقاً. استرجعت الكفالة في أقل من 24 ساعة كما وعدوا.",
      },
    ],
  },
};

export function TestimonialsSection({ language }: TestimonialsSectionProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <section className="py-20 bg-secondary" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {t.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {t.testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card p-6 rounded-xl shadow-md border border-border"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber text-amber"
                  />
                ))}
              </div>
              <p className="text-foreground mb-4 italic">"{testimonial.comment}"</p>
              <p className="font-semibold text-foreground">{testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
