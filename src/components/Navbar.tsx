import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, UserCircle, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";

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
    catalog: "Catalogue",
    howItWorks: "Comment ça marche",
    contact: "Contact",
    bookNow: "Réserver maintenant",
  },
  en: {
    home: "Home",
    fleet: "Our Fleet",
    catalog: "Catalog",
    howItWorks: "How it works",
    contact: "Contact",
    bookNow: "Book now",
  },
  ar: {
    home: "الرئيسية",
    fleet: "أسطولنا",
    catalog: "الكتالوج",
    howItWorks: "كيف يعمل",
    contact: "اتصل بنا",
    bookNow: "احجز الآن",
  },
};

export function Navbar({ language, setLanguage, onBookNow }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-display font-bold text-navy">
              Soummam<span className="text-amber">Car</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isHomePage ? (
              <button
                onClick={() => scrollTo("home")}
                className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              >
                {t.home}
              </button>
            ) : (
              <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                {t.home}
              </Link>
            )}
            <Link
              to="/vehicules"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium flex items-center gap-1"
            >
              <Car className="h-4 w-4" />
              {t.catalog}
            </Link>
            {isHomePage && (
              <>
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
              </>
            )}
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
            {isAuthenticated ? (
              <Link to="/mon-compte">
                <Button variant="ghost" size="sm" className="gap-1">
                  <UserCircle className="h-4 w-4" />
                  {user?.fullName?.split(' ')[0] || 'Compte'}
                </Button>
              </Link>
            ) : (
              <Link to="/connexion">
                <Button variant="outline" size="sm">
                  Connexion
                </Button>
              </Link>
            )}
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
              {isHomePage ? (
                <button
                  onClick={() => scrollTo("home")}
                  className="text-left py-2 text-foreground/80 hover:text-foreground"
                >
                  {t.home}
                </button>
              ) : (
                <Link to="/" onClick={() => setIsOpen(false)} className="text-left py-2 text-foreground/80 hover:text-foreground">
                  {t.home}
                </Link>
              )}
              <Link to="/vehicules" onClick={() => setIsOpen(false)} className="text-left py-2 text-foreground/80 hover:text-foreground flex items-center gap-2">
                <Car className="h-4 w-4" />
                {t.catalog}
              </Link>
              {isHomePage && (
                <>
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
                </>
              )}
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
              {isAuthenticated ? (
                <Link to="/mon-compte" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-1 mt-2">
                    <UserCircle className="h-4 w-4" />
                    {user?.fullName?.split(' ')[0] || 'Mon compte'}
                  </Button>
                </Link>
              ) : (
                <Link to="/connexion" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Connexion
                  </Button>
                </Link>
              )}
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
