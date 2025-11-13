import { db } from '../server/db';
import { users, clients, staff, services, staffServices, appointments } from '../shared/schema';
import { hashPassword } from '../server/auth';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('🧹 Clearing existing data...');
    await db.delete(appointments);
    await db.delete(staffServices);
    await db.delete(clients);
    await db.delete(services);
    await db.delete(staff);
    await db.delete(users);
    console.log('✓ Database cleared');

    console.log('📝 Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      email: 'admin@glowdesk.com',
      passwordHash: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    }).returning();

    console.log('✓ Admin user created:', adminUser.email);

    console.log('👥 Seeding clients...');
    const clientsFile = JSON.parse(
      await readFile(join(__dirname, '../src/data/clients.json'), 'utf-8')
    );
    const clientsData = clientsFile.clients || [];
    
    for (const client of clientsData.slice(0, 10)) {
      const nameParts = client.name.split(' ');
      await db.insert(clients).values({
        name: client.name,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: client.email,
        phone: client.phone,
        isVip: client.tags?.includes('VIP') || false,
        tags: client.tags || [],
        marketingOptIn: true,
      });
    }
    console.log(`✓ Seeded ${Math.min(10, clientsData.length)} clients`);

    console.log('👨‍💼 Seeding staff...');
    const staffFile = JSON.parse(
      await readFile(join(__dirname, '../src/data/staff.json'), 'utf-8')
    );
    const staffData = staffFile.data || [];
    
    const staffMembers = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    
    for (const member of staffData) {
      const nameParts = member.display_name.split(' ');
      const [staffMember] = await db.insert(staff).values({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: member.contact.email,
        phone: member.contact.phone,
        role: member.role.role_name,
        specialties: [],
        color: colors[Math.floor(Math.random() * colors.length)],
        commissionRate: '40',
        isActive: true,
        workingHours: member.work_hours || {},
      }).returning();
      staffMembers.push(staffMember);
    }
    console.log(`✓ Seeded ${staffMembers.length} staff members`);

    console.log('💇 Seeding services...');
    const servicesFile = JSON.parse(
      await readFile(join(__dirname, '../src/data/services.json'), 'utf-8')
    );
    const servicesData = servicesFile.services || [];
    
    const servicesList = [];
    for (const service of servicesData) {
      const [createdService] = await db.insert(services).values({
        name: service.name,
        description: service.description || '',
        category: service.category,
        duration: service.baseDuration || 30,
        price: String(service.basePrice || 0),
        isActive: service.isActive !== false,
        displayOrder: service.displayOrder || 0,
      }).returning();
      servicesList.push(createdService);
    }
    console.log(`✓ Seeded ${servicesList.length} services`);

    console.log('🔗 Assigning services to staff...');
    let assignmentCount = 0;
    for (const staffMember of staffMembers) {
      const randomServices = servicesList
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 5) + 3);
      
      for (const service of randomServices) {
        await db.insert(staffServices).values({
          staffId: staffMember.id,
          serviceId: service.id,
          proficiencyLevel: ['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)],
        });
        assignmentCount++;
      }
    }
    console.log(`✓ Created ${assignmentCount} staff-service assignments`);

    console.log('📅 Creating sample appointments...');
    const clientsList = await db.select().from(clients);
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    
    for (let i = 0; i < 20; i++) {
      const randomClient = clientsList[Math.floor(Math.random() * clientsList.length)];
      const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
      const randomService = servicesList[Math.floor(Math.random() * servicesList.length)];
      
      const daysOffset = Math.floor(Math.random() * 14) - 7;
      const startTime = new Date(today);
      startTime.setDate(startTime.getDate() + daysOffset);
      startTime.setHours(9 + Math.floor(Math.random() * 8), [0, 30][Math.floor(Math.random() * 2)], 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + randomService.duration);
      
      const statuses = ['pending', 'confirmed', 'in-progress', 'completed'];
      const status = daysOffset < 0 ? 'completed' : statuses[Math.floor(Math.random() * 2)];
      
      await db.insert(appointments).values({
        clientId: randomClient.id,
        staffId: randomStaff.id,
        startTime,
        endTime,
        status,
        totalPrice: randomService.price,
        depositPaid: Math.random() > 0.7,
        createdBy: adminUser.id,
      });
    }
    console.log('✓ Created 20 sample appointments');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Email: admin@glowdesk.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
