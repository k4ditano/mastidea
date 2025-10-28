-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('OWNER', 'COLLABORATOR');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Idea" ALTER COLUMN "aiProcessingStatus" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "IdeaCollaborator" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'COLLABORATOR',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaInvitation" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "inviterUserId" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "IdeaInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaCollaborator_ideaId_idx" ON "IdeaCollaborator"("ideaId");

-- CreateIndex
CREATE INDEX "IdeaCollaborator_userId_idx" ON "IdeaCollaborator"("userId");

-- CreateIndex
CREATE INDEX "IdeaCollaborator_userEmail_idx" ON "IdeaCollaborator"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaCollaborator_ideaId_userId_key" ON "IdeaCollaborator"("ideaId", "userId");

-- CreateIndex
CREATE INDEX "IdeaInvitation_ideaId_idx" ON "IdeaInvitation"("ideaId");

-- CreateIndex
CREATE INDEX "IdeaInvitation_invitedEmail_idx" ON "IdeaInvitation"("invitedEmail");

-- CreateIndex
CREATE INDEX "IdeaInvitation_invitedUserId_idx" ON "IdeaInvitation"("invitedUserId");

-- CreateIndex
CREATE INDEX "IdeaInvitation_createdAt_idx" ON "IdeaInvitation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaInvitation_ideaId_invitedEmail_key" ON "IdeaInvitation"("ideaId", "invitedEmail");

-- AddForeignKey
ALTER TABLE "IdeaCollaborator" ADD CONSTRAINT "IdeaCollaborator_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaInvitation" ADD CONSTRAINT "IdeaInvitation_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
