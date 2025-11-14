/*
  Warnings:

  - Made the column `penaltyPoints` on table `Team` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "penaltyPoints" SET NOT NULL;

-- CreateTable
CREATE TABLE "UserContainer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "containerId" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserContainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserContainer_containerId_key" ON "UserContainer"("containerId");

-- AddForeignKey
ALTER TABLE "UserContainer" ADD CONSTRAINT "UserContainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContainer" ADD CONSTRAINT "UserContainer_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
