// prisma/seed.js
// Usage:
//   1) Ensure FLAG_SALT is set in your project root .env
//   2) Run: node prisma/seed.js
//    or: npx prisma db seed  (if prisma is configured to run this file)
//
// Notes:
// - This script expects that plaintext flags are present in the 'flag' field of each challenge.
// - After verifying seeded challenges, consider removing plaintext flags from DB.

const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

//
// Force-load .env from project root (safe even if Prisma auto-loads env)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const FLAG_SALT = process.env.FLAG_SALT || '';

if (!FLAG_SALT) {
  console.warn(
    '⚠️  FLAG_SALT is not set. You should set FLAG_SALT in your .env before seeding to use salted hashes.'
  );
}

function hashFlag(flag) {
  if (typeof flag !== 'string') flag = String(flag || '');
  const canonical = flag.trim();
  return crypto.createHash('sha256').update(FLAG_SALT + canonical).digest('hex');
}

async function main() {
  console.log('🔐 Starting prisma seed (salted flags) ...');
  console.log(`🧂 FLAG_SALT loaded?: ${FLAG_SALT ? 'yes' : 'no'}`);
  console.log('');

  const challenges = [
    {
      name: 'Web Exploit 101',
      category: 'Web',
      difficulty: 'Easy',
      points: 100,
      description: 'Find the hidden flag in the vulnerable web application',
      flag: 'FLAG{web_exploit_101}',
    },
    {
      name: 'SQL Injection Master',
      category: 'Web',
      difficulty: 'Medium',
      points: 250,
      description: 'Bypass authentication using SQL injection techniques',
      flag: 'FLAG{sql_mastery}',
    },
    {
      name: 'Cryptic Messages',
      category: 'Crypto',
      difficulty: 'Medium',
      points: 300,
      description: 'Decrypt the encoded message to reveal the flag',
      flag: 'FLAG{cryptic_msg}',
    },
    {
      name: 'Binary Exploitation',
      category: 'PWN',
      difficulty: 'Hard',
      points: 500,
      description: 'Exploit the buffer overflow vulnerability',
      flag: 'FLAG{pwn_overflow}',
    },
    {
      name: 'Reverse Engineering',
      category: 'Reverse',
      difficulty: 'Hard',
      points: 450,
      description: 'Analyze the binary and extract the hidden flag',
      flag: 'FLAG{rev_engineer}',
    },
    {
      name: 'Network Forensics',
      category: 'Forensics',
      difficulty: 'Easy',
      points: 150,
      description: 'Analyze the packet capture file',
      flag: 'FLAG{net_forensics}',
    },
  ];

  for (const ch of challenges) {
    if (!ch.flag) {
      console.warn(`⚠️  Skipping "${ch.name}" — no plaintext flag provided in seed entry.`);
      continue;
    }

    const hashed = hashFlag(ch.flag);

    await prisma.challenge.upsert({
      where: { name: ch.name },
      update: {
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash: hashed,
      },
      create: {
        name: ch.name,
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash: hashed,
      },
    });

    console.log(`✅ Upserted: ${ch.name} — flagHash: ${hashed.slice(0, 8)}...`);
  }

  // optional: seed a test user if not present
  await prisma.user.upsert({
    where: { username: 'H4ck3rPr0' },
    update: {},
    create: { username: 'H4ck3rPr0' },
  });

  console.log('\n🎉 Seed finished. Verify the challenges and then consider removing plaintext flags from DB.');
}

main()
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Prisma disconnected.');
  });
