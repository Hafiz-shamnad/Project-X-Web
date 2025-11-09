/*
  Warnings:

  - A unique constraint covering the columns `[flagHash]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Challenge_flagHash_key" ON "Challenge"("flagHash");
