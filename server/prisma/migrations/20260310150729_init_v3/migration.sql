-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'AGENT', 'PARTNER', 'CLIENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "PreferredLang" AS ENUM ('FR', 'EN', 'AR', 'TZ');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('AGENCY', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('OWN_FLEET', 'AGENCY', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'PREMIUM');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('ESSENCE', 'DIESEL', 'GPL');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "KmPolicy" AS ENUM ('UNLIMITED', 'LIMITED');

-- CreateEnum
CREATE TYPE "CustodyMode" AS ENUM ('PERMANENT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('SUBMITTED', 'DOCS_REVIEW', 'PHOTOS_REVIEW', 'SCORED', 'INSPECTION_SCHEDULED', 'APPROVED', 'PROBATION', 'FULLY_VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStepName" AS ENUM ('SUBMISSION', 'DOCUMENTS', 'PHOTOS', 'SCORING', 'INSPECTION', 'PROBATION');

-- CreateEnum
CREATE TYPE "VerificationStepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('INITIAL', 'REINSPECTION', 'VIDEO');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('APPROVED', 'APPROVED_WITH_RESERVES', 'REJECTED');

-- CreateEnum
CREATE TYPE "PickupLocationType" AS ENUM ('AGENCY', 'AIRPORT', 'ADDRESS', 'HOME_DELIVERY');

-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('AVAILABLE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'BALANCE', 'CAUTION');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BARIDIMOB', 'CIB', 'EDAHABIA', 'STRIPE', 'CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'PARTIALLY_RETAINED', 'RETAINED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SIGNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PICKUP', 'RETURN');

-- CreateEnum
CREATE TYPE "FuelLevel" AS ENUM ('QUARTER', 'HALF', 'THREE_QUARTER', 'FULL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'DRIVERS_LICENSE', 'PASSPORT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "fullName" TEXT NOT NULL,
    "avatar" TEXT,
    "wilaya" TEXT,
    "country" TEXT,
    "isDiaspora" BOOLEAN NOT NULL DEFAULT false,
    "preferredLang" "PreferredLang" NOT NULL DEFAULT 'FR',
    "preferredCurrency" TEXT NOT NULL DEFAULT 'DZD',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "refreshToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idNumber" TEXT,
    "passportNumber" TEXT,
    "licenseNumber" TEXT,
    "licenseCountry" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "totalRentals" INTEGER NOT NULL DEFAULT 0,
    "loyaltyTier" "LoyaltyTier" NOT NULL DEFAULT 'BRONZE',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "internalNotes" TEXT,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "wilaya" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "logo" TEXT,
    "registreCommerce" TEXT,
    "nif" TEXT,
    "nis" TEXT,
    "businessLicenseUrl" TEXT,
    "idCardUrl" TEXT,
    "maxVehicles" INTEGER NOT NULL DEFAULT 3,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "bankName" TEXT,
    "bankRib" TEXT,
    "payoutFrequency" TEXT DEFAULT 'WEEKLY',
    "totalVehicles" INTEGER NOT NULL DEFAULT 0,
    "totalRentals" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "boostExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL DEFAULT 'OWN_FLEET',
    "partnerId" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vin" TEXT,
    "color" TEXT,
    "category" "VehicleCategory" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "seats" INTEGER NOT NULL,
    "hasAC" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dailyRate" INTEGER NOT NULL,
    "weeklyDiscount" DOUBLE PRECISION,
    "monthlyDiscount" DOUBLE PRECISION,
    "cautionAmount" INTEGER NOT NULL,
    "kmPolicy" "KmPolicy" NOT NULL DEFAULT 'UNLIMITED',
    "kmLimitPerDay" INTEGER,
    "extraKmRate" INTEGER,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "verificationScore" INTEGER,
    "verificationNotes" TEXT,
    "inspectionReport" JSONB,
    "probationRentalsCompleted" INTEGER NOT NULL DEFAULT 0,
    "lastInspectionDate" TIMESTAMP(3),
    "nextInspectionDue" TIMESTAMP(3),
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "currentKm" INTEGER NOT NULL,
    "nextServiceKm" INTEGER NOT NULL,
    "images" TEXT[],
    "registrationDocUrl" TEXT,
    "insuranceUrl" TEXT,
    "insuranceExpiry" TIMESTAMP(3) NOT NULL,
    "ctUrl" TEXT,
    "ctExpiry" TIMESTAMP(3) NOT NULL,
    "vignetteExpiry" TIMESTAMP(3) NOT NULL,
    "wilaya" TEXT,
    "city" TEXT,
    "custodyMode" "CustodyMode",
    "custodyStartDate" TIMESTAMP(3),
    "custodyEndDate" TIMESTAMP(3),
    "depositedAt" TIMESTAMP(3),
    "currentLocationId" TEXT,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "boostExpiresAt" TIMESTAMP(3),
    "boostPriority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleVerificationStep" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepName" "VerificationStepName" NOT NULL,
    "status" "VerificationStepStatus" NOT NULL DEFAULT 'PENDING',
    "performedById" TEXT,
    "notes" TEXT,
    "data" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleVerificationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInspection" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "type" "InspectionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "checklistResults" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "photos" TEXT[],
    "videoUrl" TEXT,
    "result" "InspectionResult" NOT NULL,
    "reserves" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupLocation" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "PickupLocationType" NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "wilaya" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "extraFee" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PickupLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityRule" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "AvailabilityType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL DEFAULT 'OWN_FLEET',
    "partnerId" TEXT,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "returnTime" TEXT NOT NULL,
    "pickupLocationId" TEXT,
    "returnLocationId" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "isDiaspora" BOOLEAN NOT NULL DEFAULT false,
    "flightNumber" TEXT,
    "arrivalTime" TEXT,
    "dailyRate" INTEGER NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "extrasTotal" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "depositAmount" INTEGER NOT NULL,
    "cautionAmount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL DEFAULT 0,
    "partnerPayout" INTEGER NOT NULL DEFAULT 0,
    "totalClient" INTEGER NOT NULL,
    "extras" JSONB,
    "specialRequests" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "exchangeRate" DOUBLE PRECISION,
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "gatewayResponse" JSONB,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "retainedAmount" INTEGER,
    "retainedReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "reference" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "reservationIds" TEXT[],
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "signatureUrl" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionReport" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "performedById" TEXT,
    "photos" JSONB NOT NULL,
    "kmReading" INTEGER NOT NULL,
    "fuelLevel" "FuelLevel" NOT NULL,
    "damageNotes" TEXT,
    "damagePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConditionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "partnerId" TEXT,
    "vehicleRating" INTEGER NOT NULL,
    "serviceRating" INTEGER NOT NULL,
    "cleanlinessRating" INTEGER NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "response" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "km" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "ClientProfile_userId_idx" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");

-- CreateIndex
CREATE INDEX "Partner_userId_idx" ON "Partner"("userId");

-- CreateIndex
CREATE INDEX "Partner_type_idx" ON "Partner"("type");

-- CreateIndex
CREATE INDEX "Partner_status_idx" ON "Partner"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_category_idx" ON "Vehicle"("category");

-- CreateIndex
CREATE INDEX "Vehicle_ownerType_idx" ON "Vehicle"("ownerType");

-- CreateIndex
CREATE INDEX "Vehicle_partnerId_idx" ON "Vehicle"("partnerId");

-- CreateIndex
CREATE INDEX "Vehicle_verificationStatus_idx" ON "Vehicle"("verificationStatus");

-- CreateIndex
CREATE INDEX "Vehicle_isPublished_idx" ON "Vehicle"("isPublished");

-- CreateIndex
CREATE INDEX "VehicleVerificationStep_vehicleId_idx" ON "VehicleVerificationStep"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleVerificationStep_stepName_idx" ON "VehicleVerificationStep"("stepName");

-- CreateIndex
CREATE INDEX "VehicleVerificationStep_status_idx" ON "VehicleVerificationStep"("status");

-- CreateIndex
CREATE INDEX "VehicleInspection_vehicleId_idx" ON "VehicleInspection"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleInspection_inspectorId_idx" ON "VehicleInspection"("inspectorId");

-- CreateIndex
CREATE INDEX "PickupLocation_vehicleId_idx" ON "PickupLocation"("vehicleId");

-- CreateIndex
CREATE INDEX "AvailabilityRule_vehicleId_idx" ON "AvailabilityRule"("vehicleId");

-- CreateIndex
CREATE INDEX "AvailabilityRule_startDate_endDate_idx" ON "AvailabilityRule"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_referenceNumber_key" ON "Reservation"("referenceNumber");

-- CreateIndex
CREATE INDEX "Reservation_clientId_idx" ON "Reservation"("clientId");

-- CreateIndex
CREATE INDEX "Reservation_vehicleId_idx" ON "Reservation"("vehicleId");

-- CreateIndex
CREATE INDEX "Reservation_partnerId_idx" ON "Reservation"("partnerId");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_referenceNumber_idx" ON "Reservation"("referenceNumber");

-- CreateIndex
CREATE INDEX "Reservation_pickupDate_idx" ON "Reservation"("pickupDate");

-- CreateIndex
CREATE INDEX "Payment_reservationId_idx" ON "Payment"("reservationId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payout_partnerId_idx" ON "Payout"("partnerId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_reservationId_key" ON "Contract"("reservationId");

-- CreateIndex
CREATE INDEX "Contract_reservationId_idx" ON "Contract"("reservationId");

-- CreateIndex
CREATE INDEX "ConditionReport_reservationId_idx" ON "ConditionReport"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reservationId_key" ON "Review"("reservationId");

-- CreateIndex
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");

-- CreateIndex
CREATE INDEX "Review_partnerId_idx" ON "Review"("partnerId");

-- CreateIndex
CREATE INDEX "Review_reservationId_idx" ON "Review"("reservationId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_vehicleId_idx" ON "MaintenanceRecord"("vehicleId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleVerificationStep" ADD CONSTRAINT "VehicleVerificationStep_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleVerificationStep" ADD CONSTRAINT "VehicleVerificationStep_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInspection" ADD CONSTRAINT "VehicleInspection_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInspection" ADD CONSTRAINT "VehicleInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupLocation" ADD CONSTRAINT "PickupLocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionReport" ADD CONSTRAINT "ConditionReport_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionReport" ADD CONSTRAINT "ConditionReport_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
