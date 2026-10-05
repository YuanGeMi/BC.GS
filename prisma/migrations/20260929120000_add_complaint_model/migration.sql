-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('open', 'in_review', 'resolved', 'rejected');

-- CreateEnum
CREATE TYPE "ComplaintSource" AS ENUM ('web', 'telegram');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('complaint', 'scam_report');

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "casinoId" TEXT,
    "casinoName" TEXT,
    "source" "ComplaintSource" NOT NULL DEFAULT 'web',
    "userId" TEXT,
    "telegramUserId" TEXT,
    "contactEmail" TEXT,
    "contactName" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "ComplaintStatus" NOT NULL DEFAULT 'open',
    "moderatedById" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_caseId_key" ON "Complaint"("caseId");

-- CreateIndex
CREATE INDEX "Complaint_status_createdAt_idx" ON "Complaint"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Complaint_casinoId_createdAt_idx" ON "Complaint"("casinoId", "createdAt");

-- CreateIndex
CREATE INDEX "Complaint_telegramUserId_idx" ON "Complaint"("telegramUserId");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
