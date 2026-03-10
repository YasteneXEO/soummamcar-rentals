import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, Users, Fuel, Settings, Snowflake, Shield, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useVehicles } from '@/hooks/useApi';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { vehicles as staticVehicles } from '@/lib/vehiclesData';
import type { CatalogVehicle, VehicleCategory, Transmission, FuelType } from '@/types';

type Language = 'fr' | 'en' | 'ar';

const t = {
  fr: {
    title: 'Nos Véhicules',
    subtitle: 'Tous les véhicules sont vérifiés et entretenus par SoummamCar',
    search: 'Rechercher un véhicule…',
    category: 'Catégorie',
    transmission: 'Transmission',
    fuel: 'Carburant',
    wilaya: 'Wilaya',
    priceRange: 'Budget max',
    seats: 'Places min',
    all: 'Tous',
    manual: 'Manuelle',
    automatic: 'Automatique',
    perDay: '/jour',
    book: 'Voir & Réserver',
    noResults: 'Aucun véhicule ne correspond à vos critères.',
    resetFilters: 'Réinitialiser les filtres',
    filters: 'Filtres',
    verified: 'Vérifié SoummamCar',
    results: 'véhicules trouvés',
    economy: 'Économique',
    compact: 'Compacte',
    sedan: 'Berline',
    suv: 'SUV',
    premium: 'Premium',
    essence: 'Essence',
    diesel: 'Diesel',
    gpl: 'GPL',
    ac: 'Climatisation',
  },
  en: {
    title: 'Our Vehicles',
    subtitle: 'All vehicles are verified and maintained by SoummamCar',
    search: 'Search a vehicle…',
    category: 'Category',
    transmission: 'Transmission',
    fuel: 'Fuel',
    wilaya: 'Wilaya',
    priceRange: 'Max budget',
    seats: 'Min seats',
    all: 'All',
    manual: 'Manual',
    automatic: 'Automatic',
    perDay: '/day',
    book: 'View & Book',
    noResults: 'No vehicles match your criteria.',
    resetFilters: 'Reset filters',
    filters: 'Filters',
    verified: 'SoummamCar Verified',
    results: 'vehicles found',
    economy: 'Economy',
    compact: 'Compact',
    sedan: 'Sedan',
    suv: 'SUV',
    premium: 'Premium',
    essence: 'Gasoline',
    diesel: 'Diesel',
    gpl: 'LPG',
    ac: 'Air conditioning',
  },
  ar: {
    title: 'سياراتنا',
    subtitle: 'جميع المركبات مفحوصة ومُعتنى بها من طرف سومام كار',
    search: 'ابحث عن مركبة…',
    category: 'الفئة',
    transmission: 'ناقل الحركة',
    fuel: 'الوقود',
    wilaya: 'الولاية',
    priceRange: 'الميزانية القصوى',
    seats: 'المقاعد الدنيا',
    all: 'الكل',
    manual: 'يدوي',
    automatic: 'أوتوماتيك',
    perDay: '/يوم',
    book: 'عرض وحجز',
    noResults: 'لا توجد مركبات تطابق معاييرك.',
    resetFilters: 'إعادة تعيين الفلاتر',
    filters: 'الفلاتر',
    verified: 'معتمد من سومام كار',
    results: 'مركبات موجودة',
    economy: 'اقتصادية',
    compact: 'مدمجة',
    sedan: 'سيدان',
    suv: 'SUV',
    premium: 'فاخرة',
    essence: 'بنزين',
    diesel: 'ديزل',
    gpl: 'غاز',
    ac: 'تكييف',
  },
};

const CATEGORY_OPTIONS: VehicleCategory[] = ['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'PREMIUM'];
const FUEL_OPTIONS: FuelType[] = ['ESSENCE', 'DIESEL', 'GPL'];

function VehicleCard({ vehicle, lang, convert }: { vehicle: CatalogVehicle; lang: Language; convert: (n: number) => string }) {
  const tr = t[lang];
  const isVerified = vehicle.verificationStatus === 'FULLY_VERIFIED';
  const categoryLabel = tr[vehicle.category.toLowerCase() as keyof typeof tr] || vehicle.category;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={vehicle.images?.[0] || '/placeholder-car.jpg'}
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {vehicle.isBoosted && (
            <Badge className="absolute top-2 left-2 bg-amber text-amber-foreground">
              <Star className="h-3 w-3 mr-1" /> Premium
            </Badge>
          )}
          {isVerified && (
            <Badge className="absolute top-2 right-2 bg-green-600 text-white">
              <Shield className="h-3 w-3 mr-1" /> {tr.verified}
            </Badge>
          )}
          <Badge variant="secondary" className="absolute bottom-2 left-2">
            {categoryLabel}
          </Badge>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{vehicle.name}</h3>
              {vehicle.wilaya && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {vehicle.wilaya}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber">{vehicle.dailyRate.toLocaleString()} DA</span>
              <span className="text-xs text-muted-foreground block">≈ {convert(vehicle.dailyRate)} €{tr.perDay}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {vehicle.seats}</span>
            <span className="flex items-center gap-1"><Settings className="h-3 w-3" /> {vehicle.transmission === 'MANUAL' ? tr.manual : tr.automatic}</span>
            <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {tr[vehicle.fuelType.toLowerCase() as keyof typeof tr] || vehicle.fuelType}</span>
            {vehicle.hasAC && <span className="flex items-center gap-1"><Snowflake className="h-3 w-3" /> {tr.ac}</span>}
          </div>

          {vehicle.weeklyDiscount && vehicle.weeklyDiscount > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              -{vehicle.weeklyDiscount}% semaine
            </Badge>
          )}

          <Link to={`/vehicules/${vehicle.id}`}>
            <Button className="w-full bg-amber hover:bg-amber/90 text-amber-foreground">{tr.book}</Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function VehiclesPage() {
  const [language, setLanguage] = useState<Language>('fr');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const tr = t[language];
  const { convert } = useExchangeRate(true);

  // Filter state from URL params
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const transmission = searchParams.get('transmission') || '';
  const fuel = searchParams.get('fuel') || '';
  const wilaya = searchParams.get('wilaya') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minSeats = searchParams.get('minSeats') || '';

  // Build API params
  const apiParams: Record<string, string> = {};
  if (category) apiParams.category = category;
  if (transmission) apiParams.transmission = transmission;
  if (fuel) apiParams.fuelType = fuel;
  if (wilaya) apiParams.wilaya = wilaya;
  if (maxPrice) apiParams.maxPrice = maxPrice;
  if (minSeats) apiParams.minSeats = minSeats;

  const { data, isLoading, isError } = useVehicles(Object.keys(apiParams).length > 0 ? apiParams : undefined);
  const apiVehicles: CatalogVehicle[] = data?.data || data || [];
  // Fallback to static data when API returns empty or errors
  const vehiclesList: CatalogVehicle[] = apiVehicles.length > 0 ? apiVehicles : (!isLoading ? staticVehicles : []);

  // Client-side text search
  const filtered = useMemo(() => {
    if (!search) return vehiclesList;
    const q = search.toLowerCase();
    return vehiclesList.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );
  }, [vehiclesList, search]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const resetFilters = () => setSearchParams({});
  const hasFilters = category || transmission || fuel || wilaya || maxPrice || minSeats || search;

  return (
    <div className="min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar language={language} setLanguage={setLanguage} onBookNow={() => {}} />

      <main className="flex-1 mt-20">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">{tr.title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{tr.subtitle}</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Search & filter bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => updateFilter('q', e.target.value)}
                placeholder={tr.search}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> {tr.filters}
            </Button>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 p-4 border rounded-xl bg-muted/30"
            >
              <Select value={category} onValueChange={(v) => updateFilter('category', v === 'ALL' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder={tr.category} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{tr.all}</SelectItem>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{tr[c.toLowerCase() as keyof typeof tr] || c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={transmission} onValueChange={(v) => updateFilter('transmission', v === 'ALL' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder={tr.transmission} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{tr.all}</SelectItem>
                  <SelectItem value="MANUAL">{tr.manual}</SelectItem>
                  <SelectItem value="AUTOMATIC">{tr.automatic}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={fuel} onValueChange={(v) => updateFilter('fuel', v === 'ALL' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder={tr.fuel} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{tr.all}</SelectItem>
                  {FUEL_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>{tr[f.toLowerCase() as keyof typeof tr] || f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder={tr.wilaya}
                value={wilaya}
                onChange={(e) => updateFilter('wilaya', e.target.value)}
              />

              <Input
                type="number"
                placeholder={tr.priceRange}
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />

              <Input
                type="number"
                placeholder={tr.seats}
                value={minSeats}
                onChange={(e) => updateFilter('minSeats', e.target.value)}
              />
            </motion.div>
          )}

          {/* Active filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {search && <Badge variant="secondary">{search} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('q', '')} /></Badge>}
              {category && <Badge variant="secondary">{category} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('category', '')} /></Badge>}
              {transmission && <Badge variant="secondary">{transmission} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('transmission', '')} /></Badge>}
              <Button variant="ghost" size="sm" onClick={resetFilters}>{tr.resetFilters}</Button>
            </div>
          )}

          {/* Results count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {tr.results}
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">{tr.noResults}</p>
              <Button variant="outline" onClick={resetFilters}>{tr.resetFilters}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((v) => (
                <VehicleCard key={v.id} vehicle={v} lang={language} convert={convert} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
