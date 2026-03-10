import daciaLogan from "@/assets/dacia-logan.jpg";
import renaultSymbol from "@/assets/renault-symbol.jpg";
import hyundaiI10 from "@/assets/hyundai-i10.jpg";
import kiaPicanto from "@/assets/kia-picanto.jpg";
import type { CatalogVehicle } from "@/types";

// Re-export for backward compatibility
export type { CatalogVehicle as Vehicle } from "@/types";

export const vehicles: CatalogVehicle[] = [
  {
    id: "dacia-logan",
    name: "Dacia Logan",
    images: [daciaLogan],
    seats: 5,
    transmission: "MANUAL",
    hasAC: true,
    dailyRate: 4500,
    status: "AVAILABLE",
    category: "ECONOMY",
    cautionAmount: 15000,
    brand: "Dacia",
    model: "Logan",
    fuelType: "ESSENCE",
  },
  {
    id: "renault-symbol",
    name: "Renault Symbol",
    images: [renaultSymbol],
    seats: 5,
    transmission: "MANUAL",
    hasAC: true,
    dailyRate: 4000,
    status: "AVAILABLE",
    category: "ECONOMY",
    cautionAmount: 15000,
    brand: "Renault",
    model: "Symbol",
    fuelType: "ESSENCE",
  },
  {
    id: "hyundai-i10",
    name: "Hyundai i10",
    images: [hyundaiI10],
    seats: 4,
    transmission: "MANUAL",
    hasAC: true,
    dailyRate: 3500,
    status: "RENTED",
    category: "ECONOMY",
    cautionAmount: 15000,
    brand: "Hyundai",
    model: "i10",
    fuelType: "ESSENCE",
  },
  {
    id: "kia-picanto",
    name: "Kia Picanto",
    images: [kiaPicanto],
    seats: 4,
    transmission: "AUTOMATIC",
    hasAC: true,
    dailyRate: 3500,
    status: "AVAILABLE",
    category: "COMPACT",
    cautionAmount: 20000,
    brand: "Kia",
    model: "Picanto",
    fuelType: "ESSENCE",
  },
];
