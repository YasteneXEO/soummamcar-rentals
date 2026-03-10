// ============================================================================
// SoummamCar — Unified Type Definitions
// ============================================================================
// Single source of truth for all domain types. Replaces the duplicate
// Vehicle definitions from vehiclesData.ts and adminStore.ts.
// ============================================================================

// ---------- Language & UI ----------

export type Language = 'fr' | 'en' | 'ar';

export type BookingStep =
  | 'search'
  | 'vehicles'
  | 'extras'
  | 'info'
  | 'summary'
  | 'payment'
  | 'confirmation';

// ---------- Enums (mirroring Prisma enums) ----------

export type Role = 'ADMIN' | 'AGENT' | 'CLIENT';

export type ClientStatus = 'ACTIVE' | 'MONITOR' | 'BLACKLISTED';

export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE';

export type VehicleCategory = 'ECONOMY' | 'COMPACT' | 'SEDAN' | 'SUV' | 'PREMIUM';

export type FuelType = 'ESSENCE' | 'DIESEL' | 'GPL';

export type Transmission = 'MANUAL' | 'AUTOMATIC';

export type KmPolicy = 'UNLIMITED' | 'LIMITED';

export type PickupLocation =
  | 'AGENCY_CENTER'
  | 'AIRPORT_SOUMMAM'
  | 'HOME_DELIVERY'
  | 'CUSTOM';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentType = 'DEPOSIT' | 'BALANCE' | 'CAUTION';

export type PaymentMethod =
  | 'BARIDIMOB'
  | 'CIB'
  | 'EDAHABIA'
  | 'STRIPE'
  | 'CASH'
  | 'BANK_TRANSFER';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'REFUNDED'
  | 'PARTIALLY_RETAINED'
  | 'RETAINED'
  | 'DISPUTED';

export type ContractStatus = 'DRAFT' | 'SIGNED' | 'COMPLETED';

export type ReportType = 'PICKUP' | 'RETURN';

export type FuelLevel = 'QUARTER' | 'HALF' | 'THREE_QUARTER' | 'FULL';

export type DocumentType = 'ID_CARD' | 'DRIVERS_LICENSE' | 'PASSPORT';

export type Currency = 'DZD' | 'EUR' | 'CAD' | 'GBP';

// ---------- Domain Interfaces ----------

/** Unified Vehicle definition — used for both the public catalogue and admin fleet management. */
export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  images: string[];          // URLs (first one used as thumbnail)
  dailyRate: number;         // in DZD
  cautionAmount: number;     // Variable per vehicle (15 000 – 50 000 DA)
  currentKm: number;
  nextServiceKm: number;
  fuelType: FuelType;
  transmission: Transmission;
  seats: number;
  hasAC: boolean;
  category: VehicleCategory;
  kmPolicy: KmPolicy;
  kmLimit?: number;          // if LIMITED, km/day
  insuranceExpiry: string;
  ctExpiry: string;          // Contrôle technique
  vignetteExpiry: string;
  registrationDoc?: string;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight vehicle for the public catalogue (derived from Vehicle). */
export type CatalogVehicle = Pick<
  Vehicle,
  | 'id'
  | 'name'
  | 'images'
  | 'seats'
  | 'transmission'
  | 'hasAC'
  | 'dailyRate'
  | 'category'
  | 'cautionAmount'
  | 'status'
  | 'brand'
  | 'model'
  | 'fuelType'
>;

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  wilaya?: string;
  idNumber?: string;         // CNI or passport
  licenseNumber?: string;
  passportNumber?: string;
  country?: string;          // Residence country (diaspora)
  isDiaspora: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  status: ClientStatus;
  totalRentals: number;
  lastRental?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  referenceNumber: string;   // SC-XXXXXX
  userId: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;        // "09:00"
  returnTime: string;        // "18:00"
  pickupLocation: PickupLocation;
  returnLocation: PickupLocation;
  status: ReservationStatus;
  isDiaspora: boolean;
  flightNumber?: string;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  depositAmount: number;     // 25% arrhes
  cautionAmount: number;     // Variable per vehicle
  extras?: BookingExtra[];
  specialRequests?: string;
  currency: Currency;
  exchangeRate?: number;
  createdAt: string;
  updatedAt: string;
  // Populated relations (optional)
  vehicle?: Vehicle;
  client?: Client;
  payments?: Payment[];
  contract?: Contract;
  conditionReports?: ConditionReport[];
}

export interface Payment {
  id: string;
  reservationId: string;
  type: PaymentType;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  retainedAmount?: number;
  retainedReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  reservationId: string;
  pdfUrl?: string;
  status: ContractStatus;
  signatureUrl?: string;
  signedAt?: string;
  createdAt: string;
}

export interface ConditionReport {
  id: string;
  reservationId: string;
  type: ReportType;
  photos: ConditionPhotos;
  kmReading: number;
  fuelLevel: FuelLevel;
  damageNotes?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  signature?: string;
  createdAt: string;
}

export interface ConditionPhotos {
  front_left?: string;
  front_right?: string;
  rear_left?: string;
  rear_right?: string;
  interior_front?: string;
  interior_rear?: string;
  dashboard?: string;
  trunk?: string;
}

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileUrl: string;
  verified: boolean;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  km: number;
  type: string;
  cost: number;
  notes?: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

// ---------- Booking extras ----------

export interface BookingExtra {
  key: ExtraKey;
  label: string;
  pricePerDay: number;  // DZD, 0 = flat fee
  flatFee?: number;     // If set, charged once (not per day)
  quantity: number;
}

export type ExtraKey =
  | 'baby_seat'
  | 'gps'
  | 'full_insurance'
  | 'unlimited_km'
  | 'driver'
  | 'delivery';

// ---------- API Response wrappers ----------

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: Client;
  tokens: AuthTokens;
}
