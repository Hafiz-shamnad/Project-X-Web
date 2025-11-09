// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashFlag(flag) {
  return crypto.createHash('sha256').update(flag).digest('hex');
}

async function main() {
  const challenges = [
    { name: 'Web Exploit 101', category: 'Web', difficulty: 'Easy', points: 100, description: 'Find the hidden flag in the vulnerable web application', flag: 'FLAG{web_exploit_101}' },
    { name: 'SQL Injection Master', category: 'Web', difficulty: 'Medium', points: 250, description: 'Bypass authentication using SQL injection techniques', flag: 'FLAG{sql_mastery}' },
    { name: 'Cryptic Messages', category: 'Crypto', difficulty: 'Medium', points: 300, description: 'Decrypt the encoded message to reveal the flag', flag: 'FLAG{cryptic_msg}' },
    { name: 'Binary Exploitation', category: 'PWN', difficulty: 'Hard', points: 500, description: 'Exploit the buffer overflow vulnerability', flag: 'FLAG{pwn_overflow}' },
    { name: 'Reverse Engineering', category: 'Reverse', difficulty: 'Hard', points: 450, description: 'Analyze the binary and extract the hidden flag', flag: 'FLAG{rev_engineer}' },
    { name: 'Network Forensics', category: 'Forensics', difficulty: 'Easy', points: 150, description: 'Analyze the packet capture file', flag: 'FLAG{net_forensics}' },
  ];

  for (const ch of challenges) {
    await prisma.challenge.upsert({
      where: { name: ch.name },
      update: {
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash: hashFlag(ch.flag)
      },
      create: {
        name: ch.name,
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash: hashFlag(ch.flag)
      }
    });
  }

  // seed a test user
  await prisma.user.upsert({
    where: { username: 'H4ck3rPr0' },
    update: {},
    create: { username: 'H4ck3rPr0' }
  });

  console.log('✅ Seed complete');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
