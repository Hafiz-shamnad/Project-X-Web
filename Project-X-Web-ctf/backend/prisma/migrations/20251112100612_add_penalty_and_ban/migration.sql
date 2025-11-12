-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "bannedUntil" TIMESTAMP(3),
ADD COLUMN     "penaltyPoints" INTEGER DEFAULT 0;
