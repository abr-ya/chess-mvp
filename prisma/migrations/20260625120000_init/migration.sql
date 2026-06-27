-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('CLERK');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('MANUAL', 'COMPUTER', 'ONLINE');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED', 'ABORTED');

-- CreateEnum
CREATE TYPE "ParticipantSide" AS ENUM ('WHITE', 'BLACK');

-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('WHITE_WIN', 'BLACK_WIN', 'DRAW', 'ABORTED');

-- CreateEnum
CREATE TYPE "TerminationReason" AS ENUM ('CHECKMATE', 'STALEMATE', 'INSUFFICIENT_MATERIAL', 'RESIGNATION', 'TIMEOUT', 'ABORTED');

-- CreateEnum
CREATE TYPE "TimeEventType" AS ENUM ('START', 'MOVE', 'PAUSE', 'RESUME', 'FLAG', 'ADJUST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "GameMode" NOT NULL DEFAULT 'MANUAL',
    "value" INTEGER NOT NULL DEFAULT 1200,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "mode" "GameMode" NOT NULL DEFAULT 'MANUAL',
    "status" "GameStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentFen" TEXT NOT NULL,
    "result" "GameResult",
    "terminationReason" "TerminationReason",
    "pgn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameParticipant" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT,
    "side" "ParticipantSide" NOT NULL,
    "isComputer" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "ratingBefore" INTEGER,
    "ratingAfter" INTEGER,
    "result" "GameResult",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Move" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "participantId" TEXT,
    "idempotencyKey" TEXT,
    "moveNumber" INTEGER NOT NULL,
    "side" "ParticipantSide" NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "promotion" TEXT,
    "uci" TEXT NOT NULL,
    "san" TEXT NOT NULL,
    "fenAfter" TEXT NOT NULL,
    "clockMsAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEvent" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "participantId" TEXT,
    "side" "ParticipantSide" NOT NULL,
    "type" "TimeEventType" NOT NULL,
    "remainingMs" INTEGER,
    "elapsedMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAuthIdentity_userId_idx" ON "UserAuthIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthIdentity_provider_providerUserId_key" ON "UserAuthIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_mode_key" ON "Rating"("userId", "mode");

-- CreateIndex
CREATE INDEX "Game_status_updatedAt_idx" ON "Game"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "GameParticipant_gameId_idx" ON "GameParticipant"("gameId");

-- CreateIndex
CREATE INDEX "GameParticipant_userId_createdAt_idx" ON "GameParticipant"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GameParticipant_gameId_side_key" ON "GameParticipant"("gameId", "side");

-- CreateIndex
CREATE INDEX "Move_gameId_moveNumber_idx" ON "Move"("gameId", "moveNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Move_gameId_idempotencyKey_key" ON "Move"("gameId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "TimeEvent_gameId_createdAt_idx" ON "TimeEvent"("gameId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserAuthIdentity" ADD CONSTRAINT "UserAuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameParticipant" ADD CONSTRAINT "GameParticipant_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameParticipant" ADD CONSTRAINT "GameParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "GameParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEvent" ADD CONSTRAINT "TimeEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEvent" ADD CONSTRAINT "TimeEvent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "GameParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
