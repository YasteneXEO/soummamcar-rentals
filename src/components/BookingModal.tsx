import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { fr, enUS, ar } from "date-fns/locale";
import { X, Calendar, MapPin, User, CheckCircle } from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Vehicle, vehicles } from "@/lib/vehiclesData";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "fr" | "en" | "ar";
  preSelectedVehicle?: Vehicle;
  preSelectedDates?: {
    pickup: Date;
    return: Date;
    location: string;
  };
  isDiaspora?: boolean;
}

type BookingStep = 1 | 2 | 3 | 4;

const translations = {
  fr: {
    title: "Réserver un véhicule",
    step1: "Dates & Lieu",
    step2: "Véhicule",
    step3: "Informations",
    step4: "Confirmation",
    pickupDate: "Date et heure de prise en charge",
    returnDate: "Date et heure de retour",
    location: "Lieu de prise en charge",
    agencyCenter: "Agence Béjaïa centre",
    airport: "Aéroport Soummam",
    delivery: "Livraison à domicile",
    next: "Suivant",
    previous: "Précédent",
    selectVehicle: "Sélectionnez un véhicule",
    perDay: "/jour",
    fullName: "Nom complet",
    phone: "Téléphone (WhatsApp)",
    email: "Email",
    idNumber: "Numéro pièce d'identité",
    licenseNumber: "Numéro permis de conduire",
    wilaya: "Wilaya de résidence",
    specialRequests: "Demandes spéciales (optionnel)",
    summary: "Récapitulatif de votre réservation",
    vehicle: "Véhicule",
    dates: "Dates",
    days: "jours",
    dailyRate: "Tarif journalier",
    subtotal: "Sous-total",
    deposit: "Arrhes (25%)",
    caution: "Caution",
    totalOnPickup: "Total à payer au départ",
    paymentInstructions: "Instructions de paiement des arrhes",
    baridimobInstruction: "Veuillez effectuer le virement des arrhes via BaridiMob au RIB suivant:",
    rib: "00799999004045678900148",
    internationalInstruction: "Veuillez effectuer le virement des arrhes par virement bancaire international:",
    bankName: "Banque: CPA Béjaïa",
    iban: "IBAN: DZ00 0799 9990 0404 5678 9014 8",
    swift: "SWIFT/BIC: CPAADZAL",
    accountHolder: "Titulaire: SaharaCar Location",
    termsLabel: "J'ai lu et j'accepte les conditions de location",
    confirm: "Confirmer la réservation",
    confirmed: "Réservation confirmée !",
    bookingRef: "Numéro de référence",
    confirmationMessage: "Vous recevrez un email de confirmation avec les détails de votre réservation.",
    close: "Fermer",
    available: "Disponible",
    unavailable: "Indisponible",
  },
  en: {
    title: "Book a vehicle",
    step1: "Dates & Location",
    step2: "Vehicle",
    step3: "Information",
    step4: "Confirmation",
    pickupDate: "Pick-up date and time",
    returnDate: "Return date and time",
    location: "Pick-up location",
    agencyCenter: "Béjaïa Center Agency",
    airport: "Soummam Airport",
    delivery: "Home delivery",
    next: "Next",
    previous: "Previous",
    selectVehicle: "Select a vehicle",
    perDay: "/day",
    fullName: "Full name",
    phone: "Phone (WhatsApp)",
    email: "Email",
    idNumber: "ID number",
    licenseNumber: "Driver's license number",
    wilaya: "Wilaya of residence",
    specialRequests: "Special requests (optional)",
    summary: "Your booking summary",
    vehicle: "Vehicle",
    dates: "Dates",
    days: "days",
    dailyRate: "Daily rate",
    subtotal: "Subtotal",
    deposit: "Deposit (25%)",
    caution: "Security deposit",
    totalOnPickup: "Total to pay at pick-up",
    paymentInstructions: "Deposit payment instructions",
    baridimobInstruction: "Please transfer the deposit via BaridiMob to the following RIB:",
    rib: "00799999004045678900148",
    internationalInstruction: "Please transfer the deposit via international bank transfer:",
    bankName: "Bank: CPA Béjaïa",
    iban: "IBAN: DZ00 0799 9990 0404 5678 9014 8",
    swift: "SWIFT/BIC: CPAADZAL",
    accountHolder: "Account holder: SaharaCar Location",
    termsLabel: "I have read and accept the rental terms",
    confirm: "Confirm booking",
    confirmed: "Booking confirmed!",
    bookingRef: "Reference number",
    confirmationMessage: "You will receive a confirmation email with your booking details.",
    close: "Close",
    available: "Available",
    unavailable: "Unavailable",
  },
  ar: {
    title: "حجز مركبة",
    step1: "التواريخ والمكان",
    step2: "المركبة",
    step3: "المعلومات",
    step4: "التأكيد",
    pickupDate: "تاريخ ووقت الاستلام",
    returnDate: "تاريخ ووقت الإرجاع",
    location: "مكان الاستلام",
    agencyCenter: "وكالة وسط بجاية",
    airport: "مطار الصومام",
    delivery: "التوصيل للمنزل",
    next: "التالي",
    previous: "السابق",
    selectVehicle: "اختر مركبة",
    perDay: "/يوم",
    fullName: "الاسم الكامل",
    phone: "الهاتف (واتساب)",
    email: "البريد الإلكتروني",
    idNumber: "رقم بطاقة التعريف",
    licenseNumber: "رقم رخصة القيادة",
    wilaya: "ولاية الإقامة",
    specialRequests: "طلبات خاصة (اختياري)",
    summary: "ملخص حجزك",
    vehicle: "المركبة",
    dates: "التواريخ",
    days: "أيام",
    dailyRate: "السعر اليومي",
    subtotal: "المجموع الفرعي",
    deposit: "العربون (25%)",
    caution: "الكفالة",
    totalOnPickup: "المبلغ عند الاستلام",
    paymentInstructions: "تعليمات دفع العربون",
    baridimobInstruction: "يرجى تحويل العربون عبر بريدي موب إلى الحساب التالي:",
    rib: "00799999004045678900148",
    internationalInstruction: "يرجى تحويل العربون عبر تحويل بنكي دولي:",
    bankName: "البنك: CPA بجاية",
    iban: "IBAN: DZ00 0799 9990 0404 5678 9014 8",
    swift: "SWIFT/BIC: CPAADZAL",
    accountHolder: "صاحب الحساب: SaharaCar Location",
    termsLabel: "لقد قرأت وأوافق على شروط الإيجار",
    confirm: "تأكيد الحجز",
    confirmed: "تم تأكيد الحجز!",
    bookingRef: "رقم المرجع",
    confirmationMessage: "ستتلقى بريداً إلكترونياً بتفاصيل حجزك.",
    close: "إغلاق",
    available: "متاح",
    unavailable: "غير متاح",
  },
};

const locales = { fr, en: enUS, ar };

export function BookingModal({
  isOpen,
  onClose,
  language,
  preSelectedVehicle,
  preSelectedDates,
  isDiaspora = false,
}: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>(1);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(preSelectedDates?.pickup);
  const [returnDate, setReturnDate] = useState<Date | undefined>(preSelectedDates?.return);
  const [location, setLocation] = useState(preSelectedDates?.location || "");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(preSelectedVehicle);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    licenseNumber: "",
    wilaya: "",
    specialRequests: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const { convert } = useExchangeRate(isDiaspora);
  const t = translations[language];
  const isRTL = language === "ar";

  if (!isOpen) return null;

  const numDays = pickupDate && returnDate ? differenceInDays(returnDate, pickupDate) || 1 : 1;
  const subtotal = selectedVehicle ? selectedVehicle.pricePerDay * numDays : 0;
  const depositAmount = Math.round(subtotal * 0.25);
  const cautionAmount = 20000;
  const totalOnPickup = subtotal - depositAmount + cautionAmount;

  const eurLabel = (amountDZD: number) =>
    isDiaspora ? ` (≈ ${convert(amountDZD)} €)` : "";

  const availableVehicles = vehicles.filter((v) => v.available);


  const canProceedStep1 = pickupDate && returnDate && location;
  const canProceedStep2 = selectedVehicle;
  const canProceedStep3 =
    formData.fullName &&
    formData.phone &&
    formData.email &&
    formData.idNumber &&
    formData.licenseNumber &&
    formData.wilaya;
  const canConfirm = acceptedTerms;

  const handleConfirm = () => {
    const ref = `SC-${Date.now().toString(36).toUpperCase()}`;
    setBookingRef(ref);
    setIsConfirmed(true);
  };

  const handleClose = () => {
    setStep(1);
    setPickupDate(undefined);
    setReturnDate(undefined);
    setLocation("");
    setSelectedVehicle(undefined);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      idNumber: "",
      licenseNumber: "",
      wilaya: "",
      specialRequests: "",
    });
    setAcceptedTerms(false);
    setIsConfirmed(false);
    setBookingRef("");
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              s === step
                ? "bg-amber text-amber-foreground"
                : s < step
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {s < step ? <CheckCircle className="h-5 w-5" /> : s}
          </div>
          {s < 4 && (
            <div
              className={cn(
                "w-12 h-1 mx-1",
                s < step ? "bg-green-500" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t.pickupDate}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
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

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t.returnDate}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
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

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t.location}
        </label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger>
            <SelectValue placeholder={t.location} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agency">{t.agencyCenter}</SelectItem>
            <SelectItem value="airport">{t.airport}</SelectItem>
            <SelectItem value="delivery">{t.delivery}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.selectVehicle}</p>
      <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
        {availableVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => setSelectedVehicle(vehicle)}
            className={cn(
              "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all",
              selectedVehicle?.id === vehicle.id
                ? "border-amber bg-amber/5"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-24 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{vehicle.name}</h4>
              <p className="text-sm text-muted-foreground">
                {vehicle.seats} places • {vehicle.transmission === "manual" ? "Manuelle" : "Auto"}
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-amber">
                {vehicle.pricePerDay.toLocaleString()} DA
              </span>
              {isDiaspora && (
                <span className="block text-xs text-muted-foreground">
                  ≈ {convert(vehicle.pricePerDay)} €
                </span>
              )}
              <span className="text-sm text-muted-foreground">{t.perDay}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.fullName}</label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder={t.fullName}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.phone}</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+213 555 000 000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.email}</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.idNumber}</label>
          <Input
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            placeholder={t.idNumber}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.licenseNumber}</label>
          <Input
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            placeholder={t.licenseNumber}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.wilaya}</label>
          <Input
            value={formData.wilaya}
            onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
            placeholder={t.wilaya}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">{t.specialRequests}</label>
        <Textarea
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
          placeholder={t.specialRequests}
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => {
    if (isConfirmed) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">{t.confirmed}</h3>
          <p className="text-muted-foreground mb-4">{t.bookingRef}: <strong>{bookingRef}</strong></p>
          <p className="text-sm text-muted-foreground">{t.confirmationMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t.summary}</h3>
        
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <div className="flex justify-between">
            <span>{t.vehicle}</span>
            <span className="font-medium">{selectedVehicle?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.dates}</span>
            <span className="font-medium">
              {pickupDate && format(pickupDate, "dd/MM/yyyy")} - {returnDate && format(returnDate, "dd/MM/yyyy")} ({numDays} {t.days})
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t.dailyRate}</span>
            <span className="font-medium">{selectedVehicle?.pricePerDay.toLocaleString()} DA{eurLabel(selectedVehicle?.pricePerDay || 0)}</span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span className="font-medium">{subtotal.toLocaleString()} DA{eurLabel(subtotal)}</span>
            </div>
            <div className="flex justify-between text-amber">
              <span>{t.deposit}</span>
              <span className="font-medium">-{depositAmount.toLocaleString()} DA{eurLabel(depositAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.caution}</span>
              <span className="font-medium">+{cautionAmount.toLocaleString()} DA{eurLabel(cautionAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border mt-2">
              <span>{t.totalOnPickup}</span>
              <span>{totalOnPickup.toLocaleString()} DA{eurLabel(totalOnPickup)}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber/10 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">{t.paymentInstructions}</h4>
          {isDiaspora ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">{t.internationalInstruction}</p>
              <div className="bg-background p-3 rounded space-y-1 text-sm font-mono">
                <p>{t.bankName}</p>
                <p>{t.iban}</p>
                <p>{t.swift}</p>
                <p>{t.accountHolder}</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">{t.baridimobInstruction}</p>
              <code className="block bg-background p-2 rounded text-center font-mono text-sm">
                {t.rib}
              </code>
            </>
          )}
          <p className="text-sm text-amber font-medium mt-2">
            {t.deposit}: {depositAmount.toLocaleString()} DA
          </p>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
          />
          <label htmlFor="terms" className="text-sm cursor-pointer">
            {t.termsLabel}
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-40px)]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isConfirmed && renderStepIndicator()}
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-4 p-4 border-t border-border flex-shrink-0">
          {!isConfirmed ? (
            <>
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep((s) => (s - 1) as BookingStep)}>
                  {t.previous}
                </Button>
              ) : (
                <div />
              )}
              {step < 4 ? (
                <Button
                  onClick={() => setStep((s) => (s + 1) as BookingStep)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2) ||
                    (step === 3 && !canProceedStep3)
                  }
                  className="bg-amber hover:bg-amber-hover text-amber-foreground"
                >
                  {t.next}
                </Button>
              ) : (
                <Button
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="bg-amber hover:bg-amber-hover text-amber-foreground"
                >
                  {t.confirm}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              {t.close}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
