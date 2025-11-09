const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { initDB, prisma };
