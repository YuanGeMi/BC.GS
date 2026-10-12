BEGIN;

-- Convert legacy open rows; updatedAt keeps its current value.
UPDATE "Complaint" SET "status" = 'submitted', "updatedAt" = "updatedAt" WHERE "status" = 'open' AND "type" = 'complaint';
UPDATE "Complaint" SET "status" = 'received', "updatedAt" = "updatedAt" WHERE "status" = 'open' AND "type" = 'scam_report';

-- AlterTable
ALTER TABLE "Complaint" ALTER COLUMN "status" SET DEFAULT 'submitted';

-- AddCheckConstraint (not represented in schema.prisma)
ALTER TABLE "Complaint" ADD CONSTRAINT "complaint_status_by_type" CHECK (
    ("type" = 'complaint' AND "status" IN ('submitted', 'in_review', 'waiting_for_more_information', 'resolved', 'rejected', 'closed'))
    OR ("type" = 'scam_report' AND "status" IN ('received', 'in_review', 'verified', 'not_verified', 'closed'))
);

COMMIT;
