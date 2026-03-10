import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Settings, Snowflake, Filter, ArrowRight } from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vehicles } from "@/lib/vehiclesData";
import type { CatalogVehicle } from "@/types";

interface FleetSectionProps {
  language: "fr" | "en" | "ar";
  onBookVehicle: (vehicle: CatalogVehicle) => void;
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
    viewAll: "Voir tout le catalogue",
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
    viewAll: "View full catalog",
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
    viewAll: "عرض الكتالوج الكامل",
  },
};

export function FleetSection({ language, onBookVehicle }: FleetSectionProps) {
  const t = translations[language];
  const isRTL = language === "ar";
  const { convert } = useExchangeRate(true);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [transmissionFilter, setTransmissionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  const categories = useMemo(() => [...new Set(vehicles.map((v) => v.category))], []);

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];
    if (categoryFilter !== "all") result = result.filter((v) => v.category === categoryFilter);
    if (transmissionFilter !== "all") result = result.filter((v) => v.transmission === transmissionFilter);
    if (sortBy === "price-asc") result.sort((a, b) => a.dailyRate - b.dailyRate);
    else if (sortBy === "price-desc") result.sort((a, b) => b.dailyRate - a.dailyRate);
    return result;
  }, [categoryFilter, transmissionFilter, sortBy]);

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

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-8 items-center justify-center">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Filter className="h-4 w-4" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "fr" ? "Toutes catégories" : language === "ar" ? "جميع الفئات" : "All categories"}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "fr" ? "Toutes" : language === "ar" ? "الكل" : "All"}</SelectItem>
              <SelectItem value="MANUAL">{t.manual}</SelectItem>
              <SelectItem value="AUTOMATIC">{t.automatic}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{language === "fr" ? "Par défaut" : language === "ar" ? "افتراضي" : "Default"}</SelectItem>
              <SelectItem value="price-asc">{language === "fr" ? "Prix croissant" : language === "ar" ? "سعر تصاعدي" : "Price: Low"}</SelectItem>
              <SelectItem value="price-desc">{language === "fr" ? "Prix décroissant" : language === "ar" ? "سعر تنازلي" : "Price: High"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle, index) => (
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
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
                <Badge
                  className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} ${
                    vehicle.status === 'AVAILABLE'
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {vehicle.status === 'AVAILABLE' ? t.available : t.unavailable}
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
                      {vehicle.transmission === "MANUAL" ? t.manual : t.automatic}
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
                      {vehicle.dailyRate.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground"> DA{t.perDay}</span>
                    <span className="block text-xs text-muted-foreground">
                      ≈ {convert(vehicle.dailyRate)} €{t.perDay}
                    </span>
                  </div>
                  <Button
                    onClick={() => onBookVehicle(vehicle)}
                    disabled={vehicle.status !== 'AVAILABLE'}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {t.book}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA to full catalog */}
        <div className="text-center mt-12">
          <Link to="/vehicules">
            <Button
              size="lg"
              className="bg-amber hover:bg-amber-hover text-amber-foreground font-semibold text-lg px-8 gap-2"
            >
              {t.viewAll}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
