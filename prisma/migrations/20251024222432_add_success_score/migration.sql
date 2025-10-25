-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "successAnalysis" TEXT,
ADD COLUMN     "successScore" INTEGER;

-- CreateIndex
CREATE INDEX "Idea_successScore_idx" ON "Idea"("successScore");
