-- AlterEnum
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'received';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'waiting_for_more_information';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'verified';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'not_verified';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'closed';
