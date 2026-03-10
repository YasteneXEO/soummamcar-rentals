import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SoummamCar V3 Marketplace database...');

  // ─── Super Admin ───────────────────────────────────────────
  const superAdminPw = await bcrypt.hash('SuperAdmin@2024!', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@soummamcar.dz' },
    update: {},
    create: {
      email: 'superadmin@soummamcar.dz',
      passwordHash: superAdminPw,
      fullName: 'Super Admin',
      phone: '+213555000000',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`  ✓ Super Admin: ${superAdmin.email}`);

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

  // ─── Agent user ────────────────────────────────────────────
  const agentPassword = await bcrypt.hash('Agent@2024!', 12);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@soummamcar.dz' },
    update: {},
    create: {
      email: 'agent@soummamcar.dz',
      passwordHash: agentPassword,
      fullName: 'Agent SoummamCar',
      phone: '+213555000002',
      role: 'AGENT',
    },
  });
  console.log(`  ✓ Agent: ${agent.email}`);

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
  // Client profile
  await prisma.clientProfile.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      licenseNumber: 'DL-06-123456',
      licenseCountry: 'DZ',
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
  await prisma.clientProfile.upsert({
    where: { userId: diaspora.id },
    update: {},
    create: {
      userId: diaspora.id,
      passportNumber: 'FR1234567',
      licenseNumber: 'FR-75-654321',
      licenseCountry: 'FR',
    },
  });
  console.log(`  ✓ Diaspora client: ${diaspora.email}`);

  // ─── Sample Partner (Agency) ───────────────────────────────
  const partnerPw = await bcrypt.hash('Partner@2024!', 12);
  const partnerUser = await prisma.user.upsert({
    where: { email: 'contact@autoloc-bejaia.dz' },
    update: {},
    create: {
      email: 'contact@autoloc-bejaia.dz',
      passwordHash: partnerPw,
      fullName: 'AutoLoc Béjaïa',
      phone: '+213555200001',
      role: 'PARTNER',
      wilaya: 'Béjaïa',
    },
  });
  const agencyPartner = await prisma.partner.upsert({
    where: { userId: partnerUser.id },
    update: {},
    create: {
      userId: partnerUser.id,
      type: 'AGENCY',
      status: 'ACTIVE',
      displayName: 'AutoLoc Béjaïa',
      phone: '+213555200001',
      wilaya: 'Béjaïa',
      city: 'Béjaïa',
      address: '12 Rue de la Liberté, Béjaïa',
      registreCommerce: 'RC-06-12345',
      nif: 'NIF-06-67890',
      commissionRate: 0.15,
      bankName: 'CPA',
      bankRib: '00420001234567890',
    },
  });
  console.log(`  ✓ Agency partner: ${partnerUser.email}`);

  // ─── Own Fleet Vehicles ────────────────────────────────────
  const vehiclesData = [
    {
      name: 'Renault Symbol 2023', brand: 'Renault', model: 'Symbol', year: 2023,
      plateNumber: '06001-119-06', category: 'ECONOMY' as const,
      dailyRate: 4500, cautionAmount: 20000, currentKm: 25000, nextServiceKm: 35000,
      transmission: 'MANUAL' as const, fuelType: 'DIESEL' as const, seats: 5, hasAC: true,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop'],
      status: 'AVAILABLE' as const, ownerType: 'OWN_FLEET' as const,
      isPublished: true, verificationStatus: 'FULLY_VERIFIED' as const,
      color: 'Blanc', wilaya: 'Béjaïa', city: 'Béjaïa',
      insuranceExpiry: new Date('2026-12-31'), ctExpiry: new Date('2026-06-30'), vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Dacia Logan 2023', brand: 'Dacia', model: 'Logan', year: 2023,
      plateNumber: '06002-119-06', category: 'ECONOMY' as const,
      dailyRate: 4000, cautionAmount: 20000, currentKm: 18000, nextServiceKm: 28000,
      transmission: 'MANUAL' as const, fuelType: 'DIESEL' as const, seats: 5, hasAC: true,
      images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=300&fit=crop'],
      status: 'AVAILABLE' as const, ownerType: 'OWN_FLEET' as const,
      isPublished: true, verificationStatus: 'FULLY_VERIFIED' as const,
      color: 'Gris', wilaya: 'Béjaïa', city: 'Béjaïa',
      insuranceExpiry: new Date('2026-12-31'), ctExpiry: new Date('2026-06-30'), vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Hyundai Accent 2024', brand: 'Hyundai', model: 'Accent', year: 2024,
      plateNumber: '06003-119-06', category: 'SEDAN' as const,
      dailyRate: 6000, cautionAmount: 30000, currentKm: 5000, nextServiceKm: 15000,
      transmission: 'AUTOMATIC' as const, fuelType: 'ESSENCE' as const, seats: 5, hasAC: true,
      images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop'],
      status: 'AVAILABLE' as const, ownerType: 'OWN_FLEET' as const,
      isPublished: true, verificationStatus: 'FULLY_VERIFIED' as const,
      color: 'Noir', wilaya: 'Béjaïa', city: 'Béjaïa',
      insuranceExpiry: new Date('2026-12-31'), ctExpiry: new Date('2027-01-15'), vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Peugeot 3008 2024', brand: 'Peugeot', model: '3008', year: 2024,
      plateNumber: '06004-119-06', category: 'SUV' as const,
      dailyRate: 9000, cautionAmount: 50000, currentKm: 12000, nextServiceKm: 22000,
      transmission: 'AUTOMATIC' as const, fuelType: 'DIESEL' as const, seats: 5, hasAC: true,
      images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop'],
      status: 'AVAILABLE' as const, ownerType: 'OWN_FLEET' as const,
      isPublished: true, verificationStatus: 'FULLY_VERIFIED' as const,
      color: 'Gris Platinium', wilaya: 'Béjaïa', city: 'Béjaïa',
      insuranceExpiry: new Date('2026-12-31'), ctExpiry: new Date('2027-03-01'), vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Toyota Hilux 2023', brand: 'Toyota', model: 'Hilux', year: 2023,
      plateNumber: '06005-119-06', category: 'SUV' as const,
      dailyRate: 12000, cautionAmount: 50000, currentKm: 32000, nextServiceKm: 42000,
      transmission: 'MANUAL' as const, fuelType: 'DIESEL' as const, seats: 5, hasAC: true,
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop'],
      status: 'AVAILABLE' as const, ownerType: 'OWN_FLEET' as const,
      isPublished: true, verificationStatus: 'FULLY_VERIFIED' as const,
      color: 'Blanc', wilaya: 'Béjaïa', city: 'Béjaïa',
      insuranceExpiry: new Date('2026-12-31'), ctExpiry: new Date('2026-09-15'), vignetteExpiry: new Date('2026-12-31'),
    },
    {
      name: 'Mercedes-Benz Classe C 2024', brand: 'Mercedes-Benz', model: 'Classe C', year: 2024,
      plateNumber: '06006-119-06', category: 'PREMIUM' as const,
      dailyRate: 15000, cautionAmount: 80000, currentKm: 8000, nextServiceKm: 18000,
      transmission: 'AUTOMATIC' as const, fuelType: 'DIESEL' as const, seats: 5, hasAC: true,
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop'],
      status: 'AVAILABLE' as const, ownerType: 'OWN_FLEET' as const,
      isPublished: true, verificationStatus: 'FULLY_VERIFIED' as const,
      color: 'Noir Obsidienne', wilaya: 'Béjaïa', city: 'Béjaïa',
      insuranceExpiry: new Date('2026-12-31'), ctExpiry: new Date('2027-06-01'), vignetteExpiry: new Date('2026-12-31'),
    },
  ];

  for (const v of vehiclesData) {
    await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      update: {},
      create: v,
    });
  }
  console.log(`  ✓ ${vehiclesData.length} own fleet vehicles seeded`);

  // ─── Partner Vehicle (Agency) ──────────────────────────────
  const partnerVehicle = await prisma.vehicle.upsert({
    where: { plateNumber: '06100-200-06' },
    update: {},
    create: {
      name: 'Kia Picanto 2024', brand: 'Kia', model: 'Picanto', year: 2024,
      plateNumber: '06100-200-06', category: 'ECONOMY' as const,
      dailyRate: 3500, cautionAmount: 15000, currentKm: 8000, nextServiceKm: 18000,
      transmission: 'MANUAL' as const, fuelType: 'ESSENCE' as const, seats: 5, hasAC: true,
      images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop'],
      status: 'AVAILABLE' as const, ownerType: 'AGENCY' as const,
      partnerId: agencyPartner.id,
      isPublished: true, verificationStatus: 'FULLY_VERIFIED' as const,
      verificationScore: 85,
      color: 'Rouge', wilaya: 'Béjaïa', city: 'Béjaïa',
      insuranceExpiry: new Date('2026-12-31'), ctExpiry: new Date('2027-01-31'), vignetteExpiry: new Date('2026-12-31'),
    },
  });
  console.log(`  ✓ Partner vehicle seeded: ${partnerVehicle.name}`);

  // ─── Sample reservation ────────────────────────────────────
  const vehicle = await prisma.vehicle.findFirst({ where: { plateNumber: '06001-119-06' } });
  if (vehicle) {
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 3);
    const returnDate = new Date(pickupDate);
    returnDate.setDate(returnDate.getDate() + 5);

    const dailyRate = vehicle.dailyRate;
    const totalDays = 5;
    const subtotal = dailyRate * totalDays;
    const depositAmount = Math.round(subtotal * 0.25);
    const cautionAmount = vehicle.cautionAmount;
    const totalClient = subtotal;

    await prisma.reservation.upsert({
      where: { referenceNumber: 'SC-SEED01' },
      update: {},
      create: {
        referenceNumber: 'SC-SEED01',
        clientId: client.id,
        vehicleId: vehicle.id,
        ownerType: 'OWN_FLEET',
        pickupDate,
        returnDate,
        pickupTime: '09:00',
        returnTime: '18:00',
        dailyRate,
        totalDays,
        subtotal,
        depositAmount,
        cautionAmount,
        totalClient,
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
    { key: 'agency_commission_rate', value: '0.15' },
    { key: 'individual_commission_rate', value: '0.20' },
    { key: 'payout_delay_hours', value: '48' },
    { key: 'verification_score_threshold', value: '70' },
    { key: 'probation_rentals_required', value: '3' },
    { key: 'reinspection_interval_months', value: '6' },
    { key: 'auto_suspend_rating_threshold', value: '3.0' },
    { key: 'auto_suspend_review_count', value: '5' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`  ✓ ${settings.length} settings seeded`);

  // ─── Exchange rate ─────────────────────────────────────────
  await prisma.exchangeRate.upsert({
    where: { fromCurrency_toCurrency: { fromCurrency: 'EUR', toCurrency: 'DZD' } },
    update: { rate: 238 },
    create: { fromCurrency: 'EUR', toCurrency: 'DZD', rate: 238 },
  });
  await prisma.exchangeRate.upsert({
    where: { fromCurrency_toCurrency: { fromCurrency: 'CAD', toCurrency: 'DZD' } },
    update: { rate: 165 },
    create: { fromCurrency: 'CAD', toCurrency: 'DZD', rate: 165 },
  });
  console.log('  ✓ Exchange rates seeded');

  console.log('✅ V3 Marketplace seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
