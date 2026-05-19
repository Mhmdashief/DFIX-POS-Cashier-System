"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaterials() {
  try {
    return await prisma.material.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch materials:", error);
    return [];
  }
}

export async function saveMaterialAction(data: any, id?: string) {
  try {
    if (id) {
      await prisma.material.update({
        where: { id },
        data,
      });
    } else {
      await prisma.material.create({
        data,
      });
    }
    revalidatePath("/admin/laporan-bahan");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save material:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMaterialAction(id: string) {
  try {
    await prisma.material.delete({ where: { id } });
    revalidatePath("/admin/laporan-bahan");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete material:", error);
    return { success: false, error: error.message };
  }
}

export async function getStockChartData(filter: string) {
  try {
    let where = {};
    if (filter === "critical") {
      where = { stock: { lt: 5 } };
    }

    const stocks = await prisma.material.findMany({
      where,
      orderBy: { stock: "asc" }
    });

    return stocks.map(s => ({ name: s.name, value: s.stock }));
  } catch (error) {
    console.error("Stock chart data error:", error);
    return [];
  }
}
