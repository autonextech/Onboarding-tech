import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding the database...');

  // Create default Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autonex.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@autonex.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      department: 'Management'
    }
  });
  
  console.log(`✅ Admin created: ${admin.email} / Admin@123`);

  // Create a demo Candidate user
  const candidatePassword = await bcrypt.hash('Candidate@123', 10);
  
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@autonex.com' },
    update: {},
    create: {
      name: 'Alex Sterling',
      email: 'candidate@autonex.com',
      passwordHash: candidatePassword,
      role: 'CANDIDATE',
      department: 'Engineering'
    }
  });
  
  console.log(`✅ Candidate created: ${candidate.email} / Candidate@123`);
  console.log('\n🎉 Seeding complete! Login with:');
  console.log('   Admin     → admin@autonex.com / Admin@123');
  console.log('   Candidate → candidate@autonex.com / Candidate@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
