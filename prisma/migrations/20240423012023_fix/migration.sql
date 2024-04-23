/*
  Warnings:

  - You are about to drop the column `desription` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `description` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "desription",
ADD COLUMN     "description" TEXT NOT NULL;
