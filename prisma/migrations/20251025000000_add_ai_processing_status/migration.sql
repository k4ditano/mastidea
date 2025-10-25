-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN "aiProcessingStatus" "AIProcessingStatus" NOT NULL DEFAULT 'COMPLETED';

-- CreateIndex
CREATE INDEX "Idea_aiProcessingStatus_idx" ON "Idea"("aiProcessingStatus");

-- Update existing ideas to COMPLETED status
UPDATE "Idea" SET "aiProcessingStatus" = 'COMPLETED' WHERE "aiProcessingStatus" IS NULL;
