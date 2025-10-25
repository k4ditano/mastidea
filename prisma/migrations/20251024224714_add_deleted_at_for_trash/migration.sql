-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Idea_deletedAt_idx" ON "Idea"("deletedAt");
