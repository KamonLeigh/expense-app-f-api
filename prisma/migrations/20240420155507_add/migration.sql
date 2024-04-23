/*
  Warnings:

  - A unique constraint covering the columns `[expense]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "deletedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_expense_key" ON "Expense"("expense");
