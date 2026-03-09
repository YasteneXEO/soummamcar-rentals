import { motion } from "framer-motion";
import { Users, Settings, Snowflake } from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { vehicles, Vehicle } from "@/lib/vehiclesData";

interface FleetSectionProps {
  language: "fr" | "en" | "ar";
  onBookVehicle: (vehicle: Vehicle) => void;
}

const translations = {
  fr: {
    title: "Notre Flotte",
    subtitle: "Des véhicules entretenus et vérifiés pour votre tranquillité",
    perDay: "/jour",
    book: "Réserver",
    available: "Disponible",
    unavailable: "Indisponible",
    manual: "Manuelle",
    automatic: "Automatique",
  },
  en: {
    title: "Our Fleet",
    subtitle: "Maintained and verified vehicles for your peace of mind",
    perDay: "/day",
    book: "Book",
    available: "Available",
    unavailable: "Unavailable",
    manual: "Manual",
    automatic: "Automatic",
  },
  ar: {
    title: "أسطولنا",
    subtitle: "مركبات مصانة وموثقة لراحة بالك",
    perDay: "/يوم",
    book: "احجز",
    available: "متاح",
    unavailable: "غير متاح",
    manual: "يدوي",
    automatic: "أوتوماتيك",
  },
};

export function FleetSection({ language, onBookVehicle }: FleetSectionProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <section id="fleet" className="py-20 bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
                <Badge
                  className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} ${
                    vehicle.available
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {vehicle.available ? t.available : t.unavailable}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {vehicle.name}
                </h3>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{vehicle.seats}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">
                      {vehicle.transmission === "manual" ? t.manual : t.automatic}
                    </span>
                  </div>
                  {vehicle.hasAC && (
                    <div className="flex items-center gap-1">
                      <Snowflake className="h-4 w-4" />
                      <span className="text-sm">AC</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-amber">
                      {vehicle.pricePerDay.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground"> DA{t.perDay}</span>
                  </div>
                  <Button
                    onClick={() => onBookVehicle(vehicle)}
                    disabled={!vehicle.available}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {t.book}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
