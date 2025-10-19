import { seedDatabase, autoSeedIfEmpty } from './seedData';

// Run the database seeding
async function runSeed() {
  try {
    console.log('🚀 Starting database seeding process...');
    await seedDatabase();
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    process.exit(1);
  }
}

// Run auto-seed (only if no data exists)
async function runAutoSeed() {
  try {
    console.log('🔄 Running auto-seed check...');
    await autoSeedIfEmpty();
    console.log('✅ Auto-seed process completed!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Auto-seed failed:', error);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--auto')) {
  runAutoSeed();
} else {
  runSeed();
}
