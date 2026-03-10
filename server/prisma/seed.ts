import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin user ────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@soummamcar.dz' },
    update: {},
    create: {
      email: 'admin@soummamcar.dz',
      passwordHash: adminPassword,
      fullName: 'Admin SoummamCar',
      phone: '+213555000001',
      role: 'ADMIN',
    },
  });
  console.log(`  ✓ Admin user: ${admin.email}`);

  // ─── Sample client ─────────────────────────────────────────
  const clientPassword = await bcrypt.hash('Client@2024!', 12);
  const client = await prisma.user.upsert({
    where: { email: 'karim.benali@gmail.com' },
    update: {},
    create: {
      email: 'karim.benali@gmail.com',
      passwordHash: clientPassword,
      fullName: 'Karim Benali',
      phone: '+213555123456',
      role: 'CLIENT',
      wilaya: 'Béjaïa',
    },
  });
  console.log(`  ✓ Client: ${client.email}`);

  // ─── Diaspora client ───────────────────────────────────────
  const diasporaPassword = await bcrypt.hash('Diaspora@2024!', 12);
  const diaspora = await prisma.user.upsert({
    where: { email: 'amina.khelifi@outlook.fr' },
    update: {},
    create: {
      email: 'amina.khelifi@outlook.fr',
      passwordHash: diasporaPassword,
      fullName: 'Amina Khelifi',
      phone: '+33612345678',
      role: 'CLIENT',
      isDiaspora: true,
      country: 'France',
    },
  });
  console.log(`  ✓ Diaspora client: ${diaspora.email}`);

  // ─── Vehicles ──────────────────────────────────────────────
  const vehiclesData = [
    {
      name: 'Renault Symbol 2023',
      brand: 'Renault',
      model: 'Symbol',
      year: 2023,
      plateNumber: '06001-119-06',
      category: 'ECONOMY' as const,
      dailyRate: 4500,
      cautionAmount: 20000,
      currentKm: 25000,
      nextServiceKm: 35000,
      transmission: 'MANUAL' as const,
      fuelType: 'DIESEL' as const,
      seats: 5,
      hasAC: true,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop',
      ],
      status: 'AVAILABLE' as const,
      insuranceExpiry: new Date('2026-12-31'),
      ctExpiry: new Date('2026-06-30'),
      vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Dacia Logan 2023',
      brand: 'Dacia',
      model: 'Logan',
      year: 2023,
      plateNumber: '06002-119-06',
      category: 'ECONOMY' as const,
      dailyRate: 4000,
      cautionAmount: 20000,
      currentKm: 18000,
      nextServiceKm: 28000,
      transmission: 'MANUAL' as const,
      fuelType: 'DIESEL' as const,
      seats: 5,
      hasAC: true,
      images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=300&fit=crop',
      ],
      status: 'AVAILABLE' as const,
      insuranceExpiry: new Date('2026-12-31'),
      ctExpiry: new Date('2026-06-30'),
      vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Hyundai Accent 2024',
      brand: 'Hyundai',
      model: 'Accent',
      year: 2024,
      plateNumber: '06003-119-06',
      category: 'SEDAN' as const,
      dailyRate: 6000,
      cautionAmount: 30000,
      currentKm: 5000,
      nextServiceKm: 15000,
      transmission: 'AUTOMATIC' as const,
      fuelType: 'ESSENCE' as const,
      seats: 5,
      hasAC: true,
      images: [
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop',
      ],
      status: 'AVAILABLE' as const,
      insuranceExpiry: new Date('2026-12-31'),
      ctExpiry: new Date('2027-01-15'),
      vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Peugeot 3008 2024',
      brand: 'Peugeot',
      model: '3008',
      year: 2024,
      plateNumber: '06004-119-06',
      category: 'SUV' as const,
      dailyRate: 9000,
      cautionAmount: 50000,
      currentKm: 12000,
      nextServiceKm: 22000,
      transmission: 'AUTOMATIC' as const,
      fuelType: 'DIESEL' as const,
      seats: 5,
      hasAC: true,
      images: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop',
      ],
      status: 'AVAILABLE' as const,
      insuranceExpiry: new Date('2026-12-31'),
      ctExpiry: new Date('2027-03-01'),
      vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Toyota Hilux 2023',
      brand: 'Toyota',
      model: 'Hilux',
      year: 2023,
      plateNumber: '06005-119-06',
      category: 'SUV' as const,
      dailyRate: 12000,
      cautionAmount: 50000,
      currentKm: 32000,
      nextServiceKm: 42000,
      transmission: 'MANUAL' as const,
      fuelType: 'DIESEL' as const,
      seats: 5,
      hasAC: true,
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
      ],
      status: 'AVAILABLE' as const,
      insuranceExpiry: new Date('2026-12-31'),
      ctExpiry: new Date('2026-09-15'),
      vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Mercedes-Benz Classe C 2024',
      brand: 'Mercedes-Benz',
      model: 'Classe C',
      year: 2024,
      plateNumber: '06006-119-06',
      category: 'PREMIUM' as const,
      dailyRate: 15000,
      cautionAmount: 80000,
      currentKm: 8000,
      nextServiceKm: 18000,
      transmission: 'AUTOMATIC' as const,
      fuelType: 'DIESEL' as const,
      seats: 5,
      hasAC: true,
      images: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      ],
      status: 'AVAILABLE' as const,
      insuranceExpiry: new Date('2026-12-31'),
      ctExpiry: new Date('2027-06-01'),
      vignetteExpiry: new Date('2026-12-31'),
    },
  ];

  for (const v of vehiclesData) {
    await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      update: {},
      create: v,
    });
  }
  console.log(`  ✓ ${vehiclesData.length} vehicles seeded`);

  // ─── Sample reservation ────────────────────────────────────
  const vehicle = await prisma.vehicle.findFirst({ where: { plateNumber: '06001-119-06' } });
  if (vehicle) {
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 3);
    const returnDate = new Date(pickupDate);
    returnDate.setDate(returnDate.getDate() + 5);

    await prisma.reservation.create({
      data: {
        referenceNumber: 'SC-SEED01',
        userId: client.id,
        vehicleId: vehicle.id,
        pickupDate,
        returnDate,
        pickupTime: '09:00',
        returnTime: '18:00',
        pickupLocation: 'AGENCY_CENTER',
        returnLocation: 'AGENCY_CENTER',
        dailyRate: vehicle.dailyRate,
        totalDays: 5,
        subtotal: vehicle.dailyRate * 5,
        depositAmount: Math.round(vehicle.dailyRate * 5 * 0.25),
        cautionAmount: vehicle.cautionAmount,
        status: 'CONFIRMED',
      },
    });
    console.log('  ✓ Sample reservation created');
  }

  // ─── Settings ──────────────────────────────────────────────
  const settings = [
    { key: 'company_name', value: 'SoummamCar' },
    { key: 'company_address', value: 'Béjaïa, Algérie' },
    { key: 'deposit_percentage', value: '25' },
    { key: 'eur_dzd_rate', value: '238' },
    { key: 'delivery_fee', value: '2000' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`  ✓ ${settings.length} settings seeded`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
