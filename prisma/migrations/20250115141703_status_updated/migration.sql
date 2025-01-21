-- AlterTable
ALTER TABLE "User" ALTER COLUMN "validation_status" DROP NOT NULL,
ALTER COLUMN "validation_status" SET DEFAULT 'pending',
ALTER COLUMN "validation_status" SET DATA TYPE TEXT;
