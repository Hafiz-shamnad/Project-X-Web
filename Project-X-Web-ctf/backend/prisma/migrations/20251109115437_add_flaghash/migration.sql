/*
  Warnings:

  - A unique constraint covering the columns `[userId,challengeId]` on the table `Solved` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "flagHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Solved_userId_challengeId_key" ON "Solved"("userId", "challengeId");
