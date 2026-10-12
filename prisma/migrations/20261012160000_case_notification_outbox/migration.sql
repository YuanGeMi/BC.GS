-- CreateEnum
CREATE TYPE "NotificationState" AS ENUM ('pending', 'processing', 'sent', 'permanent_failure');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "lastUserMessage" TEXT,
ADD COLUMN     "lastUserMessageAt" TIMESTAMP(3),
ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CaseNotificationOutbox" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "status" "ComplaintStatus" NOT NULL,
    "casinoLabel" TEXT NOT NULL,
    "userMessage" TEXT,
    "caseUpdatedAt" TIMESTAMP(3) NOT NULL,
    "state" "NotificationState" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseExpiresAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "telegramMessageId" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseNotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseNotificationOutbox_state_nextAttemptAt_idx" ON "CaseNotificationOutbox"("state", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "CaseNotificationOutbox_complaintId_revision_idx" ON "CaseNotificationOutbox"("complaintId", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "CaseNotificationOutbox_complaintId_revision_key" ON "CaseNotificationOutbox"("complaintId", "revision");

-- AddForeignKey
ALTER TABLE "CaseNotificationOutbox" ADD CONSTRAINT "CaseNotificationOutbox_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

