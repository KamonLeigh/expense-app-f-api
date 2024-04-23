-- CreateEnum
CREATE TYPE "Type" AS ENUM ('FOOD', 'WORK', 'HOME', 'HOBBY', 'LEISURE', 'BILL', 'OTHER');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'BILL';
