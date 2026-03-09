import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { QuickSearch } from "@/components/QuickSearch";
import { FleetSection } from "@/components/FleetSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TrustSection } from "@/components/TrustSection";
import { DiasporaSection } from "@/components/DiasporaSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { Vehicle } from "@/lib/vehiclesData";

type Language = "fr" | "en" | "ar";

const Index = () => {
  const [language, setLanguage] = useState<Language>("fr");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preSelectedVehicle, setPreSelectedVehicle] = useState<Vehicle | undefined>();
  const [preSelectedDates, setPreSelectedDates] = useState<{
    pickup: Date;
    return: Date;
    location: string;
  } | undefined>();

  const handleBookNow = () => {
    setPreSelectedVehicle(undefined);
    setPreSelectedDates(undefined);
    setIsDiaspora(false);
    setIsBookingOpen(true);
  };

  const handleViewFleet = () => {
    const element = document.getElementById("fleet");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = (pickupDate: Date, returnDate: Date, location: string) => {
    setPreSelectedDates({ pickup: pickupDate, return: returnDate, location });
    setPreSelectedVehicle(undefined);
    setIsDiaspora(false);
    setIsBookingOpen(true);
  };

  const handleBookVehicle = (vehicle: Vehicle) => {
    setPreSelectedVehicle(vehicle);
    setPreSelectedDates(undefined);
    setIsBookingOpen(true);
  };

  const [isDiaspora, setIsDiaspora] = useState(false);

  const handleBookFromAbroad = () => {
    setPreSelectedVehicle(undefined);
    setPreSelectedDates(undefined);
    setIsDiaspora(true);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar
        language={language}
        setLanguage={setLanguage}
        onBookNow={handleBookNow}
      />
      
      <HeroSection language={language} onViewFleet={handleViewFleet} />
      
      <QuickSearch language={language} onSearch={handleSearch} />
      
      <FleetSection language={language} onBookVehicle={handleBookVehicle} />
      
      <HowItWorksSection language={language} />
      
      <TrustSection language={language} />
      
      <DiasporaSection language={language} onBookFromAbroad={handleBookFromAbroad} />
      
      <TestimonialsSection language={language} />
      
      <Footer language={language} />
      
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        language={language}
        preSelectedVehicle={preSelectedVehicle}
        preSelectedDates={preSelectedDates}
      />
    </div>
  );
};

export default Index;
