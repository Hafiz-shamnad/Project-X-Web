import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const challenges = [
    { name: 'Web Exploit 101', category: 'Web', difficulty: 'Easy', points: 100, description: 'Find the hidden flag in the vulnerable web application' },
    { name: 'SQL Injection Master', category: 'Web', difficulty: 'Medium', points: 250, description: 'Bypass authentication using SQL injection techniques' },
    { name: 'Cryptic Messages', category: 'Crypto', difficulty: 'Medium', points: 300, description: 'Decrypt the encoded message to reveal the flag' },
    { name: 'Binary Exploitation', category: 'PWN', difficulty: 'Hard', points: 500, description: 'Exploit the buffer overflow vulnerability' },
    { name: 'Reverse Engineering', category: 'Reverse', difficulty: 'Hard', points: 450, description: 'Analyze the binary and extract the hidden flag' },
    { name: 'Network Forensics', category: 'Forensics', difficulty: 'Easy', points: 150, description: 'Analyze the packet capture file' },
  ];

  for (const ch of challenges) {
    await prisma.challenge.upsert({
      where: { name: ch.name },
      update: {},
      create: ch
    });
  }

  console.log('✅ Database seeded');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
