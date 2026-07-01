-- AlterTable
ALTER TABLE "Game" ADD COLUMN "importIdempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Game_ownerUserId_importIdempotencyKey_key" ON "Game"("ownerUserId", "importIdempotencyKey");
