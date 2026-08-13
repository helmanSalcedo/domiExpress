-- CreateEnum
CREATE TYPE "ChatSessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE "ChatMessageSource" AS ENUM ('WEBSOCKET', 'WHATSAPP', 'API');
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'ACTION', 'EVENT');

-- CreateTable ChatSession
CREATE TABLE "ChatSession" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "municipalityId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "socketId" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "context" JSONB,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "closedAt" TIMESTAMPTZ,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable ChatMessage
CREATE TABLE "ChatMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chatSessionId" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "source" VARCHAR(50) NOT NULL DEFAULT 'WEBSOCKET',
    "messageType" VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB,
    "tokens" INTEGER,
    "processingTimeMs" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ChatSession_customerId_idx" ON "ChatSession"("customerId");
CREATE INDEX "ChatSession_municipalityId_idx" ON "ChatSession"("municipalityId");
CREATE INDEX "ChatSession_status_idx" ON "ChatSession"("status");
CREATE INDEX "ChatSession_createdAt_idx" ON "ChatSession"("createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_chatSessionId_idx" ON "ChatMessage"("chatSessionId");
CREATE INDEX "ChatMessage_role_idx" ON "ChatMessage"("role");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX "ChatMessage_source_idx" ON "ChatMessage"("source");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
