"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTransactions(includeDeleted = false) {
  try {
    return await prisma.transaction.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });

  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function getTransactionById(id: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!transaction) return null;

    const invoiceCode = transaction.invoiceCode || `TRX-${transaction.id.slice(0, 8)}`;
    const history = await prisma.materialHistory.findMany({
      where: {
        ref: invoiceCode,
        type: "Keluar",
      },
    });

    const materials = history.map(h => ({
      name: h.bahan,
      variant: h.varian,
      category: h.kategori,
      qty: h.qty,
    }));

    return {
      ...transaction,
      materials,
    };
  } catch (error) {
    console.error("Failed to fetch transaction detail:", error);
    return null;
  }
}

export async function saveTransactionAction(data: any, id?: string) {
  try {
    const { materials, ...rest } = data;

    // Whitelist only valid Transaction schema fields to prevent Prisma errors
    const transactionData: any = {};
    const allowedFields = [
      "invoiceCode", "customerId", "customerName", "serviceName",
      "category", "notes", "totalAmount", "dpAmount", "paymentStatus",
      "orderStatus", "paymentMethod", "isDeleted"
    ];
    for (const key of allowedFields) {
      if (rest[key] !== undefined) {
        transactionData[key] = rest[key];
      }
    }

    return await prisma.$transaction(async (tx) => {
      let transaction;
      if (id) {
        transaction = await tx.transaction.update({
          where: { id },
          data: transactionData,
        });
      } else {
        transaction = await tx.transaction.create({
          data: transactionData,
        });
      }

      // Handle Material Stock Adjustment
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

      revalidatePath("/admin/transaksi");
      revalidatePath("/admin");
      revalidatePath("/kasir/transaksi");
      revalidatePath("/kasir");
      revalidatePath("/admin/laporan-bahan");
      
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

export async function updateTransactionStatusAction(id: string, status: string) {
  try {
    const data: any = { orderStatus: status };
    if (status === "Dibatalkan") {
      data.isDeleted = true;
    }
    await prisma.transaction.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/transaksi");
    revalidatePath("/kasir/transaksi");
    revalidatePath("/admin");
    revalidatePath("/kasir");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update transaction status:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentStatusAction(id: string, status: string, paymentMethod?: string) {
  try {
    const data: any = { paymentStatus: status };

    if (status === "LUNAS") {
      const current = await prisma.transaction.findUnique({ where: { id } });
      if (current) {
        data.dpAmount = current.totalAmount;
      }
    } else if (status === "DP_BAYAR") {
      // Jika balik ke DP, kita asumsikan belum ada DP yang valid atau 
      // biarkan user mengisi ulang lewat detail jika nanti diperlukan.
      // Untuk sekarang, pastikan dpAmount tidak sama dengan totalAmount.
      const current = await prisma.transaction.findUnique({ where: { id } });
      if (current && current.dpAmount === current.totalAmount) {
        data.dpAmount = 0; // Reset ke 0 agar sisa tagihan muncul lagi
      }
    }

    if (paymentMethod) {
      data.paymentMethod = paymentMethod;
    }

    await prisma.transaction.update({ where: { id }, data });
    revalidatePath("/admin/transaksi");
    revalidatePath("/kasir/transaksi");
    revalidatePath("/admin");
    revalidatePath("/kasir");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update payment status:", error);
    return { success: false, error: error.message };
  }
}
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
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5
    });


    return {
      totalIncome,
      pending,
      completed,
      customerCount,
      latestTransactions
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return null;
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    await prisma.transaction.update({ 
      where: { id },
      data: { isDeleted: true, orderStatus: "Dibatalkan" } 
    });
    revalidatePath("/admin/transaksi");
    revalidatePath("/admin");
    return { success: true };

  } catch (error: any) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function getTransactionChartData(days: number) {
  try {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const trans = await prisma.transaction.findMany({
      where: {
        isDeleted: false,
        createdAt: {
          gte: dateLimit
        }
      },

      select: {
        createdAt: true,
        totalAmount: true
      },
      orderBy: {
        createdAt: "asc"
      }
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
