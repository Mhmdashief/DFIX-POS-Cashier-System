"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATHS = [
  "/admin/transaksi", "/admin",
  "/kasir/transaksi", "/kasir",
  "/admin/laporan-bahan",
];
const revalidateAll = () => { for (const p of REVALIDATE_PATHS) revalidatePath(p); };

// ─────────────────────────────────────────────
// GET ALL TRANSACTIONS
// ─────────────────────────────────────────────
export async function getTransactions(includeDeleted = false) {
  try {
    return await prisma.transaction.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      include: {
        customer: true,
        items: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

// ─────────────────────────────────────────────
// GET SINGLE TRANSACTION BY ID
// ─────────────────────────────────────────────
export async function getTransactionById(id: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!transaction) return null;

    const invoiceCode = transaction.invoiceCode || `TRX-${transaction.id.slice(0, 8)}`;
    const history = await prisma.materialHistory.findMany({
      where: { ref: invoiceCode, type: "Keluar" },
    });

    const materials = history.map(h => ({
      name: h.bahan,
      variant: h.varian,
      category: h.kategori,
      qty: h.qty,
    }));

    return { ...transaction, materials };
  } catch (error) {
    console.error("Failed to fetch transaction detail:", error);
    return null;
  }
}

// ─────────────────────────────────────────────
// SAVE TRANSACTION (CREATE / UPDATE)
// ─────────────────────────────────────────────
export async function saveTransactionAction(data: any, id?: string) {
  try {
    const { materials, items, ...rest } = data;

    const allowedFields = [
      "invoiceCode", "customerId", "customerName", "serviceName",
      "category", "notes", "totalAmount", "dpAmount", "paymentStatus",
      "orderStatus", "paymentMethod", "isDeleted"
    ];

    const transactionData: any = {};
    for (const key of allowedFields) {
      if (rest[key] !== undefined) transactionData[key] = rest[key];
    }

    return await prisma.$transaction(async (tx) => {
      let transaction;

      if (id) {
        transaction = await tx.transaction.update({
          where: { id },
          data: transactionData,
        });
      } else {
        transaction = await tx.transaction.create({ data: transactionData });
      }

      // ── Handle Multi-Item (new feature) ──
      if (items && Array.isArray(items) && items.length > 0) {
        // Jika update, hapus item lama dulu
        if (id) {
          await tx.transactionItem.deleteMany({ where: { transactionId: id } });
        }
        for (const item of items) {
          await tx.transactionItem.create({
            data: {
              transactionId: transaction.id,
              itemName: item.itemName,
              description: item.description || null,
              serviceName: item.serviceName || null,
              category: item.category || null,
              price: parseInt(item.price) || 0,
              orderStatus: "Diproses",
            },
          });
        }
      }

      // ── Handle Material Stock ──
      if (materials && Array.isArray(materials)) {
        for (const mat of materials) {
          if (mat.id) {
            await tx.material.update({
              where: { id: mat.id },
              data: { stock: { decrement: mat.qty } },
            });
            await tx.materialHistory.create({
              data: {
                bahan: mat.name,
                varian: mat.variant,
                kategori: mat.category,
                type: "Keluar",
                qty: mat.qty,
                ref: transaction.invoiceCode || `TRX-${transaction.id.slice(0, 8)}`,
              }
            });
          }
        }
      }

      revalidateAll();
      return { success: true, id: transaction.id };
    });
  } catch (error: any) {
    console.error("Failed to save transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function addTransactionAction(data: any) {
  return await saveTransactionAction(data);
}

// ─────────────────────────────────────────────
// UPDATE STATUS TRANSAKSI (level Transaction)
// ─────────────────────────────────────────────
export async function updateTransactionStatusAction(id: string, status: string) {
  try {
    const updateData: any = { orderStatus: status };
    if (status === "Dibatalkan") updateData.isDeleted = true;

    await prisma.transaction.update({ where: { id }, data: updateData });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update transaction status:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// UPDATE STATUS ITEM (level TransactionItem)
// ─────────────────────────────────────────────
export async function updateItemStatusAction(itemId: string, status: string) {
  try {
    await prisma.transactionItem.update({
      where: { id: itemId },
      data: { orderStatus: status },
    });

    // Auto-sync: cek apakah semua item di transaksi ini sudah Selesai
    const item = await prisma.transactionItem.findUnique({
      where: { id: itemId },
      select: { transactionId: true },
    });

    if (item) {
      const allItems = await prisma.transactionItem.findMany({
        where: { transactionId: item.transactionId },
        select: { orderStatus: true },
      });

      const allDone = allItems.length > 0 && allItems.every(i => i.orderStatus === "Selesai");
      const anyDone = allItems.some(i => i.orderStatus === "Selesai");

      const transactionStatus = allDone ? "Selesai" : (anyDone ? "Diproses" : "Diproses");

      await prisma.transaction.update({
        where: { id: item.transactionId },
        data: { orderStatus: transactionStatus },
      });
    }

    revalidateAll();
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update item status:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// TANDAI ITEM DIAMBIL CUSTOMER
// ─────────────────────────────────────────────
export async function markItemPickedUpAction(itemId: string) {
  try {
    await prisma.transactionItem.update({
      where: { id: itemId },
      data: {
        isPickedUp: true,
        pickedUpAt: new Date(),
      },
    });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark item as picked up:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// UPDATE PAYMENT STATUS
// ─────────────────────────────────────────────
export async function updatePaymentStatusAction(id: string, status: string, paymentMethod?: string) {
  try {
    const data: any = { paymentStatus: status };

    if (status === "LUNAS") {
      const current = await prisma.transaction.findUnique({ where: { id } });
      if (current) data.dpAmount = current.totalAmount;
    } else if (status === "DP_BAYAR") {
      const current = await prisma.transaction.findUnique({ where: { id } });
      if (current && current.dpAmount === current.totalAmount) data.dpAmount = 0;
    }

    if (paymentMethod) data.paymentMethod = paymentMethod;

    await prisma.transaction.update({ where: { id }, data });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update payment status:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
export async function getDashboardStats() {
  try {
    const [allTrans, customerCount] = await Promise.all([
      prisma.transaction.findMany({ where: { isDeleted: false } }),
      prisma.customer.count()
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalIncome = allTrans
      .filter(t => new Date(t.createdAt) >= startOfMonth)
      .reduce((acc, curr) => acc + (curr.dpAmount || 0), 0);

    const pending = allTrans.filter(t => t.orderStatus !== 'Selesai' && t.orderStatus !== 'Dibatalkan').length;
    const completed = allTrans.filter(t => t.orderStatus === 'Selesai').length;

    const latestTransactions = await prisma.transaction.findMany({
      where: { isDeleted: false },
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return { totalIncome, pending, completed, customerCount, latestTransactions };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return null;
  }
}

// ─────────────────────────────────────────────
// DELETE TRANSACTION (soft delete)
// ─────────────────────────────────────────────
export async function deleteTransactionAction(id: string) {
  try {
    await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true, orderStatus: "Dibatalkan" }
    });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// CHART DATA
// ─────────────────────────────────────────────
export async function getTransactionChartData(days: number) {
  try {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const trans = await prisma.transaction.findMany({
      where: { isDeleted: false, createdAt: { gte: dateLimit } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" }
    });

    const grouped = trans.reduce((acc: any, curr: any) => {
      const dateLabel = new Date(curr.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      acc[dateLabel] = (acc[dateLabel] || 0) + Number(curr.totalAmount);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({ name: key, value: grouped[key] }));
  } catch (error) {
    console.error("Chart data error:", error);
    return [];
  }
}
