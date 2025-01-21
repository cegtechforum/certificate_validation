/*
  Warnings:

  - You are about to drop the column `event` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `prize` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[unique_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unique_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "event",
DROP COLUMN "phone",
DROP COLUMN "prize",
ADD COLUMN     "achievement_level" TEXT,
ADD COLUMN     "certification_type" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_of_issue" TIMESTAMP(3),
ADD COLUMN     "date_of_validation" TIMESTAMP(3),
ADD COLUMN     "event_name" TEXT,
ADD COLUMN     "fest_name" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "unique_id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validation_status" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_unique_id_key" ON "User"("unique_id");
