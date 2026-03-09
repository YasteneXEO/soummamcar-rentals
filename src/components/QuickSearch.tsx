import { useState } from "react";
import { Calendar, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr, enUS, ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface QuickSearchProps {
  language: "fr" | "en" | "ar";
  onSearch: (pickupDate: Date, returnDate: Date, location: string) => void;
}

const translations = {
  fr: {
    pickupDate: "Date de prise en charge",
    returnDate: "Date de retour",
    location: "Lieu de prise en charge",
    search: "Vérifier la disponibilité",
    agencyCenter: "Agence Béjaïa centre",
    airport: "Aéroport Soummam",
    delivery: "Livraison à domicile",
  },
  en: {
    pickupDate: "Pick-up date",
    returnDate: "Return date",
    location: "Pick-up location",
    search: "Check availability",
    agencyCenter: "Béjaïa Center Agency",
    airport: "Soummam Airport",
    delivery: "Home delivery",
  },
  ar: {
    pickupDate: "تاريخ الاستلام",
    returnDate: "تاريخ الإرجاع",
    location: "مكان الاستلام",
    search: "تحقق من التوفر",
    agencyCenter: "وكالة وسط بجاية",
    airport: "مطار الصومام",
    delivery: "التوصيل للمنزل",
  },
};

const locales = { fr, en: enUS, ar };

export function QuickSearch({ language, onSearch }: QuickSearchProps) {
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [location, setLocation] = useState<string>("");
  const t = translations[language];

  const handleSearch = () => {
    if (pickupDate && returnDate && location) {
      onSearch(pickupDate, returnDate, location);
    }
  };

  return (
    <div className="relative z-20 -mt-20">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-2xl p-6 md:p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pick-up Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t.pickupDate}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !pickupDate && "text-muted-foreground"
                    )}
                  >
                    {pickupDate
                      ? format(pickupDate, "PPP", { locale: locales[language] })
                      : t.pickupDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={pickupDate}
                    onSelect={setPickupDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t.returnDate}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    {returnDate
                      ? format(returnDate, "PPP", { locale: locales[language] })
                      : t.returnDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) =>
                      date < new Date() || (pickupDate ? date < pickupDate : false)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t.location}
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t.location} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agency">{t.agencyCenter}</SelectItem>
                  <SelectItem value="airport">{t.airport}</SelectItem>
                  <SelectItem value="delivery">{t.delivery}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="w-full h-12 bg-amber hover:bg-amber-hover text-amber-foreground font-semibold text-base"
                disabled={!pickupDate || !returnDate || !location}
              >
                <Search className="h-5 w-5 mr-2" />
                {t.search}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
