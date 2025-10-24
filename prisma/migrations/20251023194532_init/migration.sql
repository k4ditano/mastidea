-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExpansionType" AS ENUM ('SUGGESTION', 'QUESTION', 'CONNECTION', 'USE_CASE', 'CHALLENGE', 'AUTO_EXPANSION');

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "IdeaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expansion" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ExpansionType" NOT NULL,
    "aiModel" TEXT NOT NULL DEFAULT 'meta-llama/llama-3.1-8b-instruct',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expansion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Idea_createdAt_idx" ON "Idea"("createdAt");

-- CreateIndex
CREATE INDEX "Idea_status_idx" ON "Idea"("status");

-- CreateIndex
CREATE INDEX "Expansion_ideaId_idx" ON "Expansion"("ideaId");

-- CreateIndex
CREATE INDEX "Expansion_createdAt_idx" ON "Expansion"("createdAt");

-- AddForeignKey
ALTER TABLE "Expansion" ADD CONSTRAINT "Expansion_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
