// ============================================================================
// SoummamCar Marketplace V3 — Unified Type Definitions
// ============================================================================
// Single source of truth for all domain types across the platform.
// Mirrors the Prisma schema enums and models for frontend usage.
// ============================================================================

// ---------- Language & UI ----------

export type Language = 'fr' | 'en' | 'ar' | 'tz';

export type BookingStep =
  | 'search'
  | 'vehicles'
  | 'extras'
  | 'info'
  | 'summary'
  | 'payment'
  | 'confirmation';

// ---------- Enums (mirroring Prisma enums) ----------

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'PARTNER' | 'CLIENT';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export type PartnerType = 'AGENCY' | 'INDIVIDUAL';

export type PartnerStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type OwnerType = 'OWN_FLEET' | 'AGENCY' | 'INDIVIDUAL';

export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE';

export type VehicleCategory = 'ECONOMY' | 'COMPACT' | 'SEDAN' | 'SUV' | 'PREMIUM';

export type FuelType = 'ESSENCE' | 'DIESEL' | 'GPL';

export type Transmission = 'MANUAL' | 'AUTOMATIC';

export type KmPolicy = 'UNLIMITED' | 'LIMITED';

export type CustodyMode = 'PERMANENT' | 'TEMPORARY';

export type VerificationStatus =
  | 'SUBMITTED'
  | 'DOCS_REVIEW'
  | 'PHOTOS_REVIEW'
  | 'SCORED'
  | 'INSPECTION_SCHEDULED'
  | 'APPROVED'
  | 'PROBATION'
  | 'FULLY_VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type VerificationStepName =
  | 'SUBMISSION'
  | 'DOCUMENTS'
  | 'PHOTOS'
  | 'SCORING'
  | 'INSPECTION'
  | 'PROBATION';

export type VerificationStepStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PASSED'
  | 'FAILED'
  | 'SKIPPED';

export type InspectionType = 'INITIAL' | 'REINSPECTION' | 'VIDEO';

export type InspectionResult = 'APPROVED' | 'APPROVED_WITH_RESERVES' | 'REJECTED';

export type PickupLocationType = 'AGENCY' | 'AIRPORT' | 'ADDRESS' | 'HOME_DELIVERY';

export type AvailabilityType = 'AVAILABLE' | 'BLOCKED';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

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

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export type ContractStatus = 'DRAFT' | 'SIGNED' | 'COMPLETED';

export type ReportType = 'PICKUP' | 'RETURN';

export type FuelLevel = 'QUARTER' | 'HALF' | 'THREE_QUARTER' | 'FULL';

export type DocumentType = 'ID_CARD' | 'DRIVERS_LICENSE' | 'PASSPORT';

export type Currency = 'DZD' | 'EUR' | 'CAD' | 'GBP' | 'USD';

export type PreferredLang = 'FR' | 'EN' | 'AR' | 'TZ';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// ---------- Domain Interfaces ----------

/** Universal user account */
export interface User {
  id: string;
  email: string;
  phone: string;
  role: Role;
  fullName: string;
  avatar?: string;
  wilaya?: string;
  country?: string;
  isDiaspora: boolean;
  preferredLang: PreferredLang;
  preferredCurrency: Currency;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  clientProfile?: ClientProfile;
  partnerProfile?: Partner;
}

/** Client extension profile */
export interface ClientProfile {
  id: string;
  userId: string;
  idNumber?: string;
  passportNumber?: string;
  licenseNumber?: string;
  licenseCountry?: string;
  rating: number;
  totalRentals: number;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  internalNotes?: string;
}

/** Partner profile (agency or individual) */
export interface Partner {
  id: string;
  userId: string;
  type: PartnerType;
  status: PartnerStatus;
  displayName: string;
  description?: string;
  phone: string;
  whatsapp?: string;
  wilaya: string;
  city: string;
  address?: string;
  logo?: string;
  registreCommerce?: string;
  nif?: string;
  nis?: string;
  businessLicenseUrl?: string;
  idCardUrl?: string;
  maxVehicles: number;
  commissionRate: number;
  bankName?: string;
  bankRib?: string;
  payoutFrequency?: string;
  totalVehicles: number;
  totalRentals: number;
  averageRating: number;
  totalRevenue: number;
  isBoosted: boolean;
  boostExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  vehicles?: Vehicle[];
}

/** Unified Vehicle — multi-source marketplace model */
export interface Vehicle {
  id: string;
  ownerType: OwnerType;
  partnerId?: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;
  color?: string;
  category: VehicleCategory;
  fuelType: FuelType;
  transmission: Transmission;
  seats: number;
  hasAC: boolean;
  features: string[];
  dailyRate: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  cautionAmount: number;
  kmPolicy: KmPolicy;
  kmLimitPerDay?: number;
  extraKmRate?: number;
  verificationStatus: VerificationStatus;
  verificationScore?: number;
  probationRentalsCompleted: number;
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  status: VehicleStatus;
  isPublished: boolean;
  currentKm: number;
  nextServiceKm: number;
  images: string[];
  registrationDocUrl?: string;
  insuranceUrl?: string;
  insuranceExpiry: string;
  ctUrl?: string;
  ctExpiry: string;
  vignetteExpiry: string;
  wilaya?: string;
  city?: string;
  custodyMode?: CustodyMode;
  custodyStartDate?: string;
  custodyEndDate?: string;
  depositedAt?: string;
  isBoosted: boolean;
  boostExpiresAt?: string;
  boostPriority: number;
  createdAt: string;
  updatedAt: string;
  partner?: Partner;
  pickupLocations?: PickupLocationData[];
  verificationSteps?: VehicleVerificationStep[];
}

/** Lightweight vehicle for the public catalogue — hides ownerType  */
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
  | 'features'
  | 'year'
  | 'color'
  | 'kmPolicy'
  | 'weeklyDiscount'
  | 'monthlyDiscount'
  | 'wilaya'
  | 'verificationStatus'
  | 'isBoosted'
>;

export interface VehicleVerificationStep {
  id: string;
  vehicleId: string;
  stepNumber: number;
  stepName: VerificationStepName;
  status: VerificationStepStatus;
  performedById?: string;
  notes?: string;
  data?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
}

export interface VehicleInspection {
  id: string;
  vehicleId: string;
  inspectorId: string;
  type: InspectionType;
  date: string;
  location?: string;
  checklistResults: InspectionChecklist;
  totalScore: number;
  photos: string[];
  videoUrl?: string;
  result: InspectionResult;
  reserves: string[];
  notes?: string;
  createdAt: string;
}

export interface InspectionChecklist {
  exterior: Record<string, boolean>;
  interior: Record<string, boolean>;
  mechanical: Record<string, boolean>;
  documents: Record<string, boolean>;
}

export interface PickupLocationData {
  id: string;
  vehicleId: string;
  type: PickupLocationType;
  name: string;
  address?: string;
  wilaya?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  extraFee: number;
}

export interface AvailabilityRule {
  id: string;
  vehicleId: string;
  type: AvailabilityType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface Reservation {
  id: string;
  referenceNumber: string;
  clientId: string;
  vehicleId: string;
  ownerType: OwnerType;
  partnerId?: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  pickupLocationId?: string;
  returnLocationId?: string;
  status: ReservationStatus;
  isDiaspora: boolean;
  flightNumber?: string;
  arrivalTime?: string;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  extrasTotal: number;
  discountAmount: number;
  depositAmount: number;
  cautionAmount: number;
  platformFee: number;
  partnerPayout: number;
  totalClient: number;
  currency: Currency;
  exchangeRate?: number;
  extras?: BookingExtra[];
  specialRequests?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  client?: User;
  payments?: Payment[];
  contract?: Contract;
  conditionReports?: ConditionReport[];
  review?: Review;
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
  gatewayResponse?: Record<string, unknown>;
  paidAt?: string;
  refundedAt?: string;
  retainedAmount?: number;
  retainedReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  partnerId: string;
  amount: number;
  currency: Currency;
  status: PayoutStatus;
  method?: string;
  reference?: string;
  periodStart: string;
  periodEnd: string;
  reservationIds: string[];
  paidAt?: string;
  notes?: string;
  createdAt: string;
  partner?: Partner;
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
  performedById?: string;
  photos: ConditionPhotos;
  kmReading: number;
  fuelLevel: FuelLevel;
  damageNotes?: string;
  damagePhotos?: string[];
  latitude?: number;
  longitude?: number;
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

export interface Review {
  id: string;
  reservationId: string;
  authorId: string;
  partnerId?: string;
  vehicleRating: number;
  serviceRating: number;
  cleanlinessRating: number;
  overallRating: number;
  comment?: string;
  response?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
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

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
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
  pricePerDay: number;
  flatFee?: number;
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
  user: User;
  tokens: AuthTokens;
}

// ---------- Partner Portal Types ----------

export interface PartnerStats {
  totalVehicles: number;
  activeVehicles: number;
  totalRentals: number;
  monthlyRevenue: number;
  totalRevenue: number;
  averageRating: number;
  pendingPayouts: number;
  vehiclesInVerification: number;
}

export interface PartnerVehicleSubmission {
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vin: string;
  currentKm: number;
  fuelType: FuelType;
  transmission: Transmission;
  seats: number;
  hasAC: boolean;
  features: string[];
  dailyRate: number;
  cautionAmount: number;
  kmPolicy: KmPolicy;
  kmLimitPerDay?: number;
  custodyMode: CustodyMode;
  custodyStartDate?: string;
  custodyEndDate?: string;
  depositLocationId?: string;
}

export interface AdminDashboardStats {
  totalReservations: number;
  totalRevenue: number;
  totalCommissions: number;
  activeVehicles: number;
  totalPartners: number;
  vehiclesBySource: {
    ownFleet: number;
    agency: number;
    individual: number;
  };
  verificationPipeline: Record<VerificationStatus, number>;
  pendingPayouts: number;
}
