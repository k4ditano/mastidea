-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "aiProcessingStatus" "AIProcessingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Idea_aiProcessingStatus_idx" ON "Idea"("aiProcessingStatus");
