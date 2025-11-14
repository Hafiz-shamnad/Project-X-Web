/*
  Warnings:

  - You are about to drop the column `image` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "image",
ADD COLUMN     "imageName" TEXT;
