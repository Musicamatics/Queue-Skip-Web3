import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

async function seedDatabase() {
  try {
    logger.info('🌱 Seeding database with test data...');

    // Create test venues
    const hkuVenue = await prisma.venue.upsert({
      where: { id: 'venue-hku-station' },
      update: {},
      create: {
        id: 'venue-hku-station',
        name: 'HKU Station',
        type: 'transit',
        address: 'HKU Station, Hong Kong',
        timezone: 'Asia/Hong_Kong',
        config: {
          id: 'venue-hku-station',
          name: 'HKU Station',
          type: 'transit',
          authMethods: [
            { type: 'sso', provider: 'hku-sso', priority: 1 },
            { type: 'government_id', priority: 2 },
            { type: 'email', priority: 3 },
            { type: 'web3_wallet', priority: 4 },
          ],
          passTypes: [],
          features: {
            passTransfer: true,
            communityForum: true,
            passExpiration: true,
            governmentIdRequired: false,
            oneTimePasses: true,
            surveyRequired: true,
            usagePredictions: true,
            allowAutoRegistration: true,
          },
        },
      },
    });

    const commercialVenue = await prisma.venue.upsert({
      where: { id: 'venue-commercial-building' },
      update: {},
      create: {
        id: 'venue-commercial-building',
        name: 'Central Commercial Building',
        type: 'commercial',
        address: 'Central District, Hong Kong',
        timezone: 'Asia/Hong_Kong',
        config: {
          id: 'venue-commercial-building',
          name: 'Central Commercial Building',
          type: 'commercial',
          authMethods: [
            { type: 'email', priority: 1 },
            { type: 'web3_wallet', priority: 2 },
          ],
          passTypes: [],
          features: {
            passTransfer: false,
            communityForum: false,
            passExpiration: true,
            governmentIdRequired: false,
            oneTimePasses: true,
            surveyRequired: false,
            usagePredictions: false,
            allowAutoRegistration: true,
          },
        },
      },
    });

    // Create pass types
    const standardPassType = await prisma.passType.create({
      data: {
        id: 'pass-standard',
        venueId: hkuVenue.id,
        name: 'Standard Pass',
        description: 'Regular queue skip pass with survey requirement',
        restrictions: [
          { type: 'time_window', value: '06:00-23:00' },
          { type: 'usage_count', value: '1' },
        ],
        validityPeriod: 24, // 24 hours
        transferable: true,
      },
    });

    const fastPassType = await prisma.passType.create({
      data: {
        id: 'pass-fast',
        venueId: hkuVenue.id,
        name: 'Fast Pass',
        description: 'Priority queue skip pass for rush hours',
        restrictions: [
          { type: 'time_window', value: '07:00-09:00,17:00-19:00' },
          { type: 'usage_count', value: '1' },
        ],
        validityPeriod: 4, // 4 hours
        transferable: true,
      },
    });

    const visitorPassType = await prisma.passType.create({
      data: {
        id: 'pass-visitor',
        venueId: commercialVenue.id,
        name: 'Visitor Pass',
        description: 'One-time visitor pass for building access',
        restrictions: [
          { type: 'time_window', value: '09:00-18:00' },
          { type: 'usage_count', value: '1' },
        ],
        validityPeriod: 2, // 2 hours
        transferable: false,
      },
    });

    // Create pass allocations
    await prisma.passAllocation.create({
      data: {
        venueId: hkuVenue.id,
        userGroup: 'students',
        passTypeId: standardPassType.id,
        quantity: 2,
        period: 'daily',
        autoRenew: true,
      },
    });

    await prisma.passAllocation.create({
      data: {
        venueId: hkuVenue.id,
        userGroup: 'employees',
        passTypeId: fastPassType.id,
        quantity: 1,
        period: 'daily',
        autoRenew: true,
      },
    });

    await prisma.passAllocation.create({
      data: {
        venueId: commercialVenue.id,
        userGroup: 'visitors',
        passTypeId: visitorPassType.id,
        quantity: 1,
        period: 'daily',
        autoRenew: false,
      },
    });

    // Create test users
    const testUser1 = await prisma.user.create({
      data: {
        id: 'user-test-student',
        email: 'student@hku.hk',
        governmentId: 'HK123456789',
        role: 'user',
      },
    });

    const testUser2 = await prisma.user.create({
      data: {
        id: 'user-test-employee',
        email: 'employee@hku.hk',
        ssoId: 'hku-sso-123',
        role: 'user',
      },
    });

    const testUser3 = await prisma.user.create({
      data: {
        id: 'user-test-visitor',
        email: 'visitor@example.com',
        web3Address: '5fHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        role: 'user',
      },
    });

    // Create admin test users
    const adminUser1 = await prisma.user.create({
      data: {
        id: 'user-admin-hku',
        email: 'admin@hku.hk',
        governmentId: 'HK999999999',
        role: 'admin',
      },
    });

    const adminUser2 = await prisma.user.create({
      data: {
        id: 'user-admin-commercial',
        email: 'admin@commercial.hk',
        ssoId: 'commercial-admin-123',
        role: 'admin',
      },
    });

    const superAdmin = await prisma.user.create({
      data: {
        id: 'user-super-admin',
        email: 'superadmin@queueskip.com',
        role: 'super_admin',
      },
    });

    // Create user venue associations
    await prisma.userVenueAssociation.create({
      data: {
        userId: testUser1.id,
        venueId: hkuVenue.id,
        userGroup: 'students',
        role: 'user',
      },
    });

    await prisma.userVenueAssociation.create({
      data: {
        userId: testUser2.id,
        venueId: hkuVenue.id,
        userGroup: 'employees',
        role: 'user',
      },
    });

    await prisma.userVenueAssociation.create({
      data: {
        userId: testUser3.id,
        venueId: commercialVenue.id,
        userGroup: 'visitors',
        role: 'user',
      },
    });

    // Create admin venue associations
    await prisma.userVenueAssociation.create({
      data: {
        userId: adminUser1.id,
        venueId: hkuVenue.id,
        userGroup: 'administrators',
        role: 'admin',
      },
    });

    await prisma.userVenueAssociation.create({
      data: {
        userId: adminUser2.id,
        venueId: commercialVenue.id,
        userGroup: 'administrators',
        role: 'admin',
      },
    });

    // Super admin doesn't need venue associations as they have global access

    // Create some usage predictions
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeSlots = [
      { hour: 8, passes: 50, confidence: 0.85 },
      { hour: 9, passes: 75, confidence: 0.90 },
      { hour: 12, passes: 40, confidence: 0.75 },
      { hour: 17, passes: 80, confidence: 0.95 },
      { hour: 18, passes: 65, confidence: 0.88 },
    ];

    for (const slot of timeSlots) {
      const slotDate = new Date(tomorrow);
      slotDate.setHours(slot.hour);

      await prisma.usagePrediction.create({
        data: {
          venueId: hkuVenue.id,
          date: slotDate,
          timeSlot: `${slot.hour.toString().padStart(2, '0')}:00`,
          expectedPasses: slot.passes,
          confidence: slot.confidence,
        },
      });
    }

    logger.info('✅ Database seeded successfully');
    logger.info(`Created venues: ${hkuVenue.name}, ${commercialVenue.name}`);
    logger.info(`Created pass types: ${standardPassType.name}, ${fastPassType.name}, ${visitorPassType.name}`);
    logger.info(`Created test users: ${testUser1.email}, ${testUser2.email}, ${testUser3.email}`);
    logger.info(`Created admin users: ${adminUser1.email}, ${adminUser2.email}, ${superAdmin.email}`);

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export default seedDatabase;
