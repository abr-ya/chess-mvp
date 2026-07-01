-- AlterTable
ALTER TABLE "Game" ADD COLUMN "ownerUserId" TEXT;

-- Preserve ownership for existing games through their first linked participant.
UPDATE "Game" AS game
SET "ownerUserId" = participant."userId"
FROM "GameParticipant" AS participant
WHERE participant."gameId" = game."id"
  AND participant."userId" IS NOT NULL
  AND game."ownerUserId" IS NULL;

-- CreateIndex
CREATE INDEX "Game_ownerUserId_createdAt_idx" ON "Game"("ownerUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
