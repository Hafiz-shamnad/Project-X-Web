// scripts/createAdmin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

(async () => {
  try {
    const username = 'admin';
    const password = 'admin123';
    const email = 'admin@projectx.local';

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log('⚠️ Admin already exists:', existing.username);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'admin', // 👈 make sure role column exists in your Prisma schema
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Email:', email);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
