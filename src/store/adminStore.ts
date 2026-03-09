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

// Sample data - will be populated later
const sampleVehicles: Vehicle[] = [];
const sampleClients: Client[] = [];
const sampleReservations: Reservation[] = [];
const samplePayments: Payment[] = [];
const sampleMaintenanceRecords: MaintenanceRecord[] = [];
const sampleContracts: Contract[] = [];
const sampleConditionReports: ConditionReport[] = [];

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