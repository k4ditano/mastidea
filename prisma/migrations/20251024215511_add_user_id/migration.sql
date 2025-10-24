/*
  Warnings:

  - Added the required column `userId` to the `Idea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Primero añadimos la columna como nullable
ALTER TABLE "Idea" ADD COLUMN "userId" TEXT;

-- Actualizamos las filas existentes con un usuario por defecto
UPDATE "Idea" SET "userId" = 'user_migration_default' WHERE "userId" IS NULL;

-- Ahora hacemos la columna NOT NULL
ALTER TABLE "Idea" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Idea_userId_idx" ON "Idea"("userId");
