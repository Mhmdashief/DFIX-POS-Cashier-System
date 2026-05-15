/*
  Warnings:

  - You are about to drop the column `remainingBalance` on the `Transaction` table. All the data in the column will be lost.
  - The `paymentStatus` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "remainingBalance",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" "TransactionStatus" NOT NULL DEFAULT 'DP_BAYAR';
