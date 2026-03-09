import daciaLogan from "@/assets/dacia-logan.jpg";
import renaultSymbol from "@/assets/renault-symbol.jpg";
import hyundaiI10 from "@/assets/hyundai-i10.jpg";
import kiaPicanto from "@/assets/kia-picanto.jpg";

export interface Vehicle {
  id: string;
  name: string;
  image: string;
  seats: number;
  transmission: "manual" | "automatic";
  hasAC: boolean;
  pricePerDay: number;
  available: boolean;
}

export const vehicles: Vehicle[] = [
  {
    id: "dacia-logan",
    name: "Dacia Logan",
    image: daciaLogan,
    seats: 5,
    transmission: "manual",
    hasAC: true,
    pricePerDay: 4500,
    available: true,
  },
  {
    id: "renault-symbol",
    name: "Renault Symbol",
    image: renaultSymbol,
    seats: 5,
    transmission: "manual",
    hasAC: true,
    pricePerDay: 4000,
    available: true,
  },
  {
    id: "hyundai-i10",
    name: "Hyundai i10",
    image: hyundaiI10,
    seats: 4,
    transmission: "manual",
    hasAC: true,
    pricePerDay: 3500,
    available: false,
  },
  {
    id: "kia-picanto",
    name: "Kia Picanto",
    image: kiaPicanto,
    seats: 4,
    transmission: "automatic",
    hasAC: true,
    pricePerDay: 3500,
    available: true,
  },
];
