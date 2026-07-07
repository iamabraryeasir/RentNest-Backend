/*
  Warnings:

  - You are about to drop the column `rentalRequestId` on the `reviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_rentalRequestId_fkey";

-- DropIndex
DROP INDEX "reviews_rentalRequestId_key";

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "rentalRequestId";
