const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// Support SQLite via adapter (matches app runtime)
function buildPrismaClient() {
  const rawUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  const cleaned = String(rawUrl).trim().replace(/^["']|["']$/g, '');

  let dbPath = cleaned.replace(/^file:/i, '').replace(/^\/+/, '');
  if (dbPath.startsWith('./')) {
    dbPath = dbPath.slice(2);
  }
  const absolutePath = path.resolve(process.cwd(), dbPath || 'prisma/dev.db');

  const adapter = new PrismaBetterSqlite3({ url: absolutePath });

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

const prisma = buildPrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@pce.edu' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@pce.edu',
        passwordHash: hashedPassword,
        role: 'admin',
      },
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('📧 Email: admin@pce.edu');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();


