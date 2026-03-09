import { create } from 'zustand';

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  status: 'available' | 'rented' | 'maintenance' | 'unavailable';
  image: string;
  dailyRate: number;
  currentKm: number;
  nextServiceKm: number;
  fuelType: 'essence' | 'diesel' | 'gpl';
  transmission: 'manual' | 'automatic';
  seats: number;
  airConditioning: boolean;
  insuranceExpiry: string;
  controleTechniqueExpiry: string;
  vignetteExpiry: string;
  registrationDocument: string;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  wilaya: string;
  idNumber: string;
  licenseNumber: string;
  rating: 1 | 2 | 3 | 4 | 5;
  status: 'reliable' | 'monitor' | 'blacklisted';
  totalRentals: number;
  lastRental?: string;
  internalNotes: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  referenceNumber: string;
  clientId: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  deposit: number; // 25% of total
  securityDeposit: number;
  totalAmount: number;
  specialRequests?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  type: 'deposit' | 'balance' | 'security_deposit';
  amount: number;
  method: 'baridimob' | 'cib' | 'cash';
  status: 'pending' | 'paid' | 'refunded';
  paidAt?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  km: number;
  type: string;
  cost: number;
  notes: string;
  nextServiceDue?: string;
}

export interface Contract {
  id: string;
  reservationId: string;
  status: 'draft' | 'signed' | 'completed';
  createdAt: string;
  signedAt?: string;
}

export interface ConditionReport {
  id: string;
  reservationId: string;
  type: 'pickup' | 'return';
  photos: {
    front_left?: string;
    front_right?: string;
    rear_left?: string;
    rear_right?: string;
    interior_front?: string;
    interior_rear?: string;
    dashboard?: string;
    trunk?: string;
  };
  kmReading: number;
  fuelLevel: '1/4' | '1/2' | '3/4' | 'full';
  damageNotes: string;
  signature?: string;
  createdAt: string;
}

interface AdminStore {
  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Data
  vehicles: Vehicle[];
  clients: Client[];
  reservations: Reservation[];
  payments: Payment[];
  maintenanceRecords: MaintenanceRecord[];
  contracts: Contract[];
  conditionReports: ConditionReport[];

  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Client operations
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalRentals'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Reservation operations
  addReservation: (reservation: Omit<Reservation, 'id' | 'referenceNumber' | 'createdAt'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;

  // Payment operations
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;

  // Contract operations
  generateContract: (reservationId: string) => string;
  signContract: (contractId: string) => void;

  // Condition report operations
  addConditionReport: (report: Omit<ConditionReport, 'id' | 'createdAt'>) => void;
  updateConditionReport: (id: string, updates: Partial<ConditionReport>) => void;
}

// Sample data
const sampleVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Dacia Logan',
    plateNumber: '06-123-45',
    brand: 'Dacia',
    model: 'Logan',
    year: 2020,
    status: 'available',
    image: '/src/assets/dacia-logan.jpg',
    dailyRate: 4500,
    currentKm: 85000,
    nextServiceKm: 90000,
    fuelType: 'essence',
    transmission: 'manual',
    seats: 5,
    airConditioning: true,
    insuranceExpiry: '2024-08-15',
    controleTechniqueExpiry: '2024-10-20',
    vignetteExpiry: '2024-12-31',
    registrationDocument: 'DOC123456789'
  },
  {
    id: '2',
    name: 'Renault Symbol',
    plateNumber: '06-789-12',
    brand: 'Renault',
    model: 'Symbol',
    year: 2019,
    status: 'rented',
    image: '/src/assets/renault-symbol.jpg',
    dailyRate: 4000,
    currentKm: 92000,
    nextServiceKm: 95000,
    fuelType: 'essence',
    transmission: 'manual',
    seats: 5,
    airConditioning: true,
    insuranceExpiry: '2024-06-30',
    controleTechniqueExpiry: '2024-09-15',
    vignetteExpiry: '2024-12-31',
    registrationDocument: 'DOC987654321'
  },
  {
    id: '3',
    name: 'Hyundai i10',
    plateNumber: '06-456-78',
    brand: 'Hyundai',
    model: 'i10',
    year: 2021,
    status: 'available',
    image: '/src/assets/hyundai-i10.jpg',
    dailyRate: 3500,
    currentKm: 35000,
    nextServiceKm: 40000,
    fuelType: 'essence',
    transmission: 'manual',
    seats: 4,
    airConditioning: true,
    insuranceExpiry: '2024-11-20',
    controleTechniqueExpiry: '2025-01-10',
    vignetteExpiry: '2024-12-31',
    registrationDocument: 'DOC456789123'
  }
];

const sampleClients: Client[] = [
  {
    id: '1',
    fullName: 'Ahmed Benali',
    phone: '+213 555 123 456',
    whatsapp: '+213 555 123 456',
    email: 'ahmed.benali@email.com',
    wilaya: 'Béjaïa',
    idNumber: '1234567890123456',
    licenseNumber: 'BJ123456789',
    rating: 5,
    status: 'reliable',
    totalRentals: 3,
    lastRental: '2024-11-15',
    internalNotes: 'Client fiable, toujours ponctuel aux rendez-vous.',
    createdAt: '2023-08-15T10:00:00Z'
  },
  {
    id: '2',
    fullName: 'Fatima Kouadri',
    phone: '+213 666 789 123',
    whatsapp: '+213 666 789 123',
    email: 'fatima.kouadri@email.com',
    wilaya: 'Béjaïa',
    idNumber: '2345678901234567',
    licenseNumber: 'BJ987654321',
    rating: 4,
    status: 'reliable',
    totalRentals: 2,
    lastRental: '2024-10-20',
    internalNotes: 'Conduite prudente, véhicule rendu propre.',
    createdAt: '2023-09-20T14:30:00Z'
  },
  {
    id: '3',
    fullName: 'Mohamed Amrani',
    phone: '+213 777 456 789',
    email: 'mohamed.amrani@email.com',
    wilaya: 'Béjaïa',
    idNumber: '3456789012345678',
    licenseNumber: 'BJ555666777',
    rating: 3,
    status: 'monitor',
    totalRentals: 1,
    lastRental: '2024-09-10',
    internalNotes: 'Premier client, à surveiller pour les prochaines locations.',
    createdAt: '2024-08-01T09:15:00Z'
  },
  {
    id: '4',
    fullName: 'Khadija Benaissa',
    phone: '+213 555 987 654',
    whatsapp: '+213 555 987 654',
    email: 'khadija.benaissa@email.com',
    wilaya: 'Béjaïa',
    idNumber: '4567890123456789',
    licenseNumber: 'BJ111222333',
    rating: 5,
    status: 'reliable',
    totalRentals: 4,
    lastRental: '2024-12-01',
    internalNotes: 'Excellente cliente, recommandations fréquentes.',
    createdAt: '2023-06-10T16:45:00Z'
  },
  {
    id: '5',
    fullName: 'Youcef Meziani',
    phone: '+213 666 321 654',
    email: 'youcef.meziani@email.com',
    wilaya: 'Béjaïa',
    idNumber: '5678901234567890',
    licenseNumber: 'BJ444555666',
    rating: 2,
    status: 'monitor',
    totalRentals: 2,
    lastRental: '2024-07-15',
    internalNotes: 'Retards fréquents, à surveiller.',
    createdAt: '2024-03-12T11:20:00Z'
  }
];

const sampleReservations: Reservation[] = [
  {
    id: '1',
    referenceNumber: 'SC240001',
    clientId: '2',
    vehicleId: '2',
    pickupDate: '2024-12-10T09:00:00Z',
    returnDate: '2024-12-13T18:00:00Z',
    pickupLocation: 'Agence Béjaïa centre',
    status: 'in_progress',
    dailyRate: 4000,
    totalDays: 3,
    subtotal: 12000,
    deposit: 3000,
    securityDeposit: 15000,
    totalAmount: 27000, // subtotal (12000) + securityDeposit (15000)
    createdAt: '2024-12-05T10:30:00Z'
  },
  {
    id: '2',
    referenceNumber: 'SC240002',
    clientId: '1',
    vehicleId: '1',
    pickupDate: '2024-12-15T08:00:00Z',
    returnDate: '2024-12-18T17:00:00Z',
    pickupLocation: 'Aéroport Soummam',
    status: 'confirmed',
    dailyRate: 4500,
    totalDays: 3,
    subtotal: 13500,
    deposit: 3375,
    securityDeposit: 20000,
    totalAmount: 33500, // subtotal (13500) + securityDeposit (20000)
    specialRequests: 'Livraison aéroport demandée',
    createdAt: '2024-12-08T15:20:00Z'
  },
  {
    id: '3',
    referenceNumber: 'SC240003',
    clientId: '4',
    vehicleId: '3',
    pickupDate: '2024-11-25T10:00:00Z',
    returnDate: '2024-11-28T16:00:00Z',
    pickupLocation: 'Agence Béjaïa centre',
    status: 'completed',
    dailyRate: 3500,
    totalDays: 3,
    subtotal: 10500,
    deposit: 2625,
    securityDeposit: 15000,
    totalAmount: 13125,
    createdAt: '2024-11-20T12:10:00Z'
  }
];

const samplePayments: Payment[] = [
  {
    id: '1',
    reservationId: '1',
    type: 'deposit',
    amount: 3000,
    method: 'baridimob',
    status: 'paid',
    paidAt: '2024-12-05T11:00:00Z'
  },
  {
    id: '2',
    reservationId: '1',
    type: 'security_deposit',
    amount: 15000,
    method: 'cash',
    status: 'paid',
    paidAt: '2024-12-10T09:30:00Z'
  },
  {
    id: '3',
    reservationId: '2',
    type: 'deposit',
    amount: 3375,
    method: 'baridimob',
    status: 'paid',
    paidAt: '2024-12-08T15:45:00Z'
  },
  {
    id: '4',
    reservationId: '3',
    type: 'deposit',
    amount: 2625,
    method: 'baridimob',
    status: 'paid',
    paidAt: '2024-11-20T12:30:00Z'
  },
  {
    id: '5',
    reservationId: '3',
    type: 'balance',
    amount: 7875,
    method: 'cash',
    status: 'paid',
    paidAt: '2024-11-25T10:15:00Z'
  },
  {
    id: '6',
    reservationId: '3',
    type: 'security_deposit',
    amount: 15000,
    method: 'cash',
    status: 'refunded',
    paidAt: '2024-11-28T16:30:00Z'
  }
];

const sampleMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    vehicleId: '1',
    date: '2024-10-15',
    km: 80000,
    type: 'Révision complète',
    cost: 15000,
    notes: 'Vidange, filtres, courroie de distribution',
    nextServiceDue: '2024-12-15'
  },
  {
    id: '2',
    vehicleId: '2',
    date: '2024-09-20',
    km: 88000,
    type: 'Pneus neufs',
    cost: 25000,
    notes: 'Remplacement des 4 pneus'
  },
  {
    id: '3',
    vehicleId: '3',
    date: '2024-11-05',
    km: 32000,
    type: 'Contrôle technique',
    cost: 3000,
    notes: 'Contrôle technique validé'
  }
];

const sampleContracts: Contract[] = [
  {
    id: '1',
    reservationId: '1',
    status: 'signed',
    createdAt: '2024-12-09T14:00:00Z',
    signedAt: '2024-12-10T09:00:00Z'
  },
  {
    id: '2',
    reservationId: '3',
    status: 'completed',
    createdAt: '2024-11-24T16:30:00Z',
    signedAt: '2024-11-25T10:00:00Z'
  }
];

const sampleConditionReports: ConditionReport[] = [
  {
    id: '1',
    reservationId: '3',
    type: 'pickup',
    photos: {
      front_left: '/placeholder-car-photo.jpg',
      front_right: '/placeholder-car-photo.jpg',
      dashboard: '/placeholder-dashboard.jpg'
    },
    kmReading: 32000,
    fuelLevel: 'full',
    damageNotes: 'RAS - Véhicule en excellent état',
    createdAt: '2024-11-25T10:00:00Z'
  },
  {
    id: '2',
    reservationId: '3',
    type: 'return',
    photos: {
      front_left: '/placeholder-car-photo.jpg',
      front_right: '/placeholder-car-photo.jpg',
      dashboard: '/placeholder-dashboard.jpg'
    },
    kmReading: 32250,
    fuelLevel: '3/4',
    damageNotes: 'Léger éclat sur pare-brise avant droit',
    createdAt: '2024-11-28T16:00:00Z'
  }
];

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Auth
  isAuthenticated: false,
  login: (email: string, password: string) => {
    if (email === 'admin@soummamcar.dz' && password === 'demo1234') {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),

  // Data
  vehicles: sampleVehicles,
  clients: sampleClients,
  reservations: sampleReservations,
  payments: samplePayments,
  maintenanceRecords: sampleMaintenanceRecords,
  contracts: sampleContracts,
  conditionReports: sampleConditionReports,

  // Vehicle operations
  addVehicle: (vehicle) => set((state) => ({
    vehicles: [...state.vehicles, { ...vehicle, id: Date.now().toString() }]
  })),
  
  updateVehicle: (id, updates) => set((state) => ({
    vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
  
  deleteVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.filter(v => v.id !== id)
  })),

  // Client operations
  addClient: (client) => set((state) => ({
    clients: [...state.clients, { 
      ...client, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalRentals: 0
    }]
  })),
  
  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c.id !== id)
  })),

  // Reservation operations
  addReservation: (reservation) => set((state) => {
    const newReservation = {
      ...reservation,
      id: Date.now().toString(),
      referenceNumber: `SC${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    return { reservations: [...state.reservations, newReservation] };
  }),
  
  updateReservation: (id, updates) => set((state) => ({
    reservations: state.reservations.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
  
  deleteReservation: (id) => set((state) => ({
    reservations: state.reservations.filter(r => r.id !== id)
  })),

  // Payment operations
  addPayment: (payment) => set((state) => ({
    payments: [...state.payments, { ...payment, id: Date.now().toString() }]
  })),
  
  updatePayment: (id, updates) => set((state) => ({
    payments: state.payments.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  // Contract operations
  generateContract: (reservationId) => {
    const contractId = Date.now().toString();
    set((state) => ({
      contracts: [...state.contracts, {
        id: contractId,
        reservationId,
        status: 'draft' as const,
        createdAt: new Date().toISOString()
      }]
    }));
    return contractId;
  },
  
  signContract: (contractId) => set((state) => ({
    contracts: state.contracts.map(c => 
      c.id === contractId 
        ? { ...c, status: 'signed' as const, signedAt: new Date().toISOString() }
        : c
    )
  })),

  // Condition report operations
  addConditionReport: (report) => set((state) => ({
    conditionReports: [...state.conditionReports, { 
      ...report, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }]
  })),
  
  updateConditionReport: (id, updates) => set((state) => ({
    conditionReports: state.conditionReports.map(r => 
      r.id === id ? { ...r, ...updates } : r
    )
  }))
}));