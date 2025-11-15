/*
  Warnings:

  - A unique constraint covering the columns `[userId,challengeId]` on the table `UserContainer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserContainer_userId_challengeId_key" ON "UserContainer"("userId", "challengeId");
