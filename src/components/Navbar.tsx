import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = "fr" | "en" | "ar";

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onBookNow: () => void;
}

const translations = {
  fr: {
    home: "Accueil",
    fleet: "Notre Flotte",
    howItWorks: "Comment ça marche",
    contact: "Contact",
    bookNow: "Réserver maintenant",
  },
  en: {
    home: "Home",
    fleet: "Our Fleet",
    howItWorks: "How it works",
    contact: "Contact",
    bookNow: "Book now",
  },
  ar: {
    home: "الرئيسية",
    fleet: "أسيارتنا",
    howItWorks: "كيف يعمل",
    contact: "اتصل بنا",
    bookNow: "احجز الآن",
  },
};

export function Navbar({ language, setLanguage, onBookNow }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-display font-bold text-navy">
              Soummam<span className="text-amber">Car</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollTo("home")}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t.home}
            </button>
            <button
              onClick={() => scrollTo("fleet")}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t.fleet}
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t.howItWorks}
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t.contact}
            </button>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  {language.toUpperCase()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("fr")}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ar")}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={onBookNow}
              className="bg-amber hover:bg-amber-hover text-amber-foreground font-semibold"
            >
              {t.bookNow}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => scrollTo("home")}
                className="text-left py-2 text-foreground/80 hover:text-foreground"
              >
                {t.home}
              </button>
              <button
                onClick={() => scrollTo("fleet")}
                className="text-left py-2 text-foreground/80 hover:text-foreground"
              >
                {t.fleet}
              </button>
              <button
                onClick={() => scrollTo("how-it-works")}
                className="text-left py-2 text-foreground/80 hover:text-foreground"
              >
                {t.howItWorks}
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className="text-left py-2 text-foreground/80 hover:text-foreground"
              >
                {t.contact}
              </button>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage("fr")}
                  className={language === "fr" ? "bg-secondary" : ""}
                >
                  FR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-secondary" : ""}
                >
                  EN
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage("ar")}
                  className={language === "ar" ? "bg-secondary" : ""}
                >
                  AR
                </Button>
              </div>
              <Button
                onClick={onBookNow}
                className="bg-amber hover:bg-amber-hover text-amber-foreground font-semibold mt-2"
              >
                {t.bookNow}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
