// Database Seeding Script
// Creates test data for development

const { PrismaClient: UserPrisma } = require('../services/user-service/node_modules/@prisma/client');
const { AuthUtils } = require('../packages/utils/dist');

const userPrisma = new UserPrisma({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://notalabel:notalabel123@localhost:5432/notalabel'
    }
  }
});

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      email: 'demo@not-a-label.art',
      username: 'demoartist',
      displayName: 'Demo Artist',
      password: await AuthUtils.hashPassword('demo123456'),
      isVerified: true,
    },
    {
      email: 'test@not-a-label.art',
      username: 'testmusician',
      displayName: 'Test Musician',
      password: await AuthUtils.hashPassword('test123456'),
      isVerified: true,
    },
  ];

  for (const userData of users) {
    const user = await userPrisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    
    console.log(`✓ Created user: ${user.email}`);
    
    // Create artist profile
    await userPrisma.artistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        stageName: userData.displayName,
        genres: ['indie', 'electronic'],
        location: 'Los Angeles, CA',
        socialLinks: {
          instagram: 'https://instagram.com/notalabel',
          spotify: 'https://spotify.com/artist/demo',
        },
      },
    });
    
    console.log(`✓ Created artist profile for: ${user.email}`);
  }
}

async function main() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    await seedUsers();
    // Add more seed functions as needed
    
    console.log('\n✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await userPrisma.$disconnect();
  }
}

main();