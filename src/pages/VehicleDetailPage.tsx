import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft, Calendar, MapPin, Users, Settings, Fuel, Snowflake, Shield, Star,
  ChevronLeft, ChevronRight, Check, Clock, Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useVehicle, useReviews } from '@/hooks/useApi';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import type { Review } from '@/types';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'fr' | 'en' | 'ar'>('fr');
  const [currentImage, setCurrentImage] = useState(0);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();

  const { data: vehicle, isLoading } = useVehicle(id);
  const { data: reviewsData } = useReviews(id ? { vehicleId: id } : undefined);
  const reviews: Review[] = reviewsData?.data || reviewsData || [];
  const { convert } = useExchangeRate(true);

  const veh = vehicle?.data || vehicle;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar language={language} setLanguage={setLanguage} onBookNow={() => {}} />
        <main className="flex-1 container mx-auto px-4 py-8 mt-20">
          <Skeleton className="h-96 rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-2/3" />
        </main>
      </div>
    );
  }

  if (!veh) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar language={language} setLanguage={setLanguage} onBookNow={() => {}} />
        <main className="flex-1 container mx-auto px-4 py-20 mt-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">Véhicule introuvable.</p>
          <Link to="/vehicules"><Button variant="outline">Retour au catalogue</Button></Link>
        </main>
        <Footer language={language} />
      </div>
    );
  }

  const images = veh.images?.length ? veh.images : ['/placeholder-car.jpg'];
  const isVerified = veh.verificationStatus === 'FULLY_VERIFIED';

  const numDays = pickupDate && returnDate
    ? Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / 86_400_000))
    : 0;
  const subtotal = numDays * veh.dailyRate;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length).toFixed(1)
    : null;

  const handleBook = () => {
    const params = new URLSearchParams();
    params.set('vehicleId', veh.id);
    if (pickupDate) params.set('pickup', pickupDate.toISOString());
    if (returnDate) params.set('return', returnDate.toISOString());
    navigate(`/reservation?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar language={language} setLanguage={setLanguage} onBookNow={() => {}} />

      <main className="flex-1 mt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link to="/vehicules" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour au catalogue
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Images & details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[16/10]">
                <img src={images[currentImage]} alt={veh.name} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition ${idx === currentImage ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {isVerified && (
                    <Badge className="bg-green-600 text-white"><Shield className="h-3 w-3 mr-1" /> Vérifié SoummamCar</Badge>
                  )}
                  {veh.isBoosted && (
                    <Badge className="bg-amber text-amber-foreground"><Star className="h-3 w-3 mr-1" /> Premium</Badge>
                  )}
                </div>
              </div>

              {/* Title & specs */}
              <div>
                <h1 className="text-3xl font-bold text-primary">{veh.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  {veh.wilaya && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {veh.wilaya}</span>}
                  {veh.year && <span>{veh.year}</span>}
                  {avgRating && (
                    <span className="flex items-center gap-1 text-amber">
                      <Star className="h-4 w-4 fill-amber" /> {avgRating} ({reviews.length} avis)
                    </span>
                  )}
                </div>
              </div>

              {/* Specifications */}
              <Card>
                <CardHeader><CardTitle>Caractéristiques</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-sm text-muted-foreground">Places</p><p className="font-medium">{veh.seats}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-sm text-muted-foreground">Transmission</p><p className="font-medium">{veh.transmission === 'MANUAL' ? 'Manuelle' : 'Automatique'}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Fuel className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-sm text-muted-foreground">Carburant</p><p className="font-medium">{veh.fuelType}</p></div>
                    </div>
                    {veh.hasAC && (
                      <div className="flex items-center gap-3">
                        <Snowflake className="h-5 w-5 text-muted-foreground" />
                        <div><p className="text-sm text-muted-foreground">Climatisation</p><p className="font-medium">Oui</p></div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-sm text-muted-foreground">Politique km</p><p className="font-medium">{veh.kmPolicy === 'UNLIMITED' ? 'Illimité' : `${veh.kmLimitPerDay || 0} km/jour`}</p></div>
                    </div>
                    {veh.color && (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border bg-muted" />
                        <div><p className="text-sm text-muted-foreground">Couleur</p><p className="font-medium">{veh.color}</p></div>
                      </div>
                    )}
                  </div>

                  {veh.features?.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Équipements</p>
                        <div className="flex flex-wrap gap-2">
                          {veh.features.map((f: string) => (
                            <Badge key={f} variant="secondary"><Check className="h-3 w-3 mr-1" /> {f}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Reviews */}
              {reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" /> Avis clients ({reviews.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.slice(0, 5).map((r) => (
                      <div key={r.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{r.author?.fullName || 'Client'}</span>
                          <div className="flex items-center gap-1 text-amber">
                            <Star className="h-4 w-4 fill-amber" /> {r.overallRating.toFixed(1)}
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        {r.response && (
                          <div className="mt-2 pl-4 border-l-2 border-primary/20 text-sm">
                            <span className="font-medium text-primary">SoummamCar : </span>{r.response}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(r.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right — Booking sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-amber">{veh.dailyRate.toLocaleString()} DA</span>
                    <span className="text-muted-foreground">/jour</span>
                    <p className="text-sm text-muted-foreground">≈ {convert(veh.dailyRate)} €</p>
                  </div>

                  {veh.weeklyDiscount > 0 && (
                    <Badge variant="outline" className="w-full justify-center text-green-600 border-green-200">
                      -{veh.weeklyDiscount}% pour 7+ jours
                    </Badge>
                  )}
                  {veh.monthlyDiscount > 0 && (
                    <Badge variant="outline" className="w-full justify-center text-green-600 border-green-200">
                      -{veh.monthlyDiscount}% pour 30+ jours
                    </Badge>
                  )}

                  <Separator />

                  {/* Date pickers */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-1 mb-1">
                        <Calendar className="h-4 w-4" /> Prise en charge
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            {pickupDate ? format(pickupDate, 'dd/MM/yyyy') : 'Choisir une date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={pickupDate}
                            onSelect={setPickupDate}
                            disabled={(d) => d < new Date()}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-1 mb-1">
                        <Calendar className="h-4 w-4" /> Retour
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            {returnDate ? format(returnDate, 'dd/MM/yyyy') : 'Choisir une date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={returnDate}
                            onSelect={setReturnDate}
                            disabled={(d) => d < (pickupDate || new Date())}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {numDays > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{veh.dailyRate.toLocaleString()} DA × {numDays} jour{numDays > 1 ? 's' : ''}</span>
                        <span className="font-medium">{subtotal.toLocaleString()} DA</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Caution</span>
                        <span>{veh.cautionAmount?.toLocaleString()} DA</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-amber hover:bg-amber/90 text-amber-foreground text-lg py-6"
                    onClick={handleBook}
                    disabled={!pickupDate || !returnDate}
                  >
                    Réserver maintenant
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Caution : {veh.cautionAmount?.toLocaleString()} DA (≈ {convert(veh.cautionAmount || 0)} €)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
