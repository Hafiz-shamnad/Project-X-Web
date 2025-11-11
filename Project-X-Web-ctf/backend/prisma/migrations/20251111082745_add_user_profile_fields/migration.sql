-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT DEFAULT '/default-avatar.png',
ADD COLUMN     "bio" TEXT DEFAULT 'Cybersecurity enthusiast.',
ADD COLUMN     "country" TEXT DEFAULT 'Unknown';
