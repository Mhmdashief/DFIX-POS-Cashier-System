-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "serviceName" TEXT,
    "category" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "orderStatus" TEXT NOT NULL DEFAULT 'Diproses',
    "isPickedUp" BOOLEAN NOT NULL DEFAULT false,
    "pickedUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
