"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        transactions: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, id: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function saveCustomerAction(data: any, id?: string) {
  try {
    if (id) {
      await prisma.customer.update({
        where: { id },
        data,
      });
    } else {
      await prisma.customer.create({
        data,
      });
    }
    revalidatePath("/admin/data-pelanggan");
    revalidatePath("/kasir/data-pelanggan");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save customer:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/admin/data-pelanggan");
    revalidatePath("/kasir/data-pelanggan");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete customer:", error);
    return { success: false, error: error.message };
  }
}
