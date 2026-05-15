"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaterialHistory() {
  try {
    return await prisma.materialHistory.findMany({
      orderBy: { tanggal: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch material history:", error);
    return [];
  }
}

export async function addMaterialHistoryAction(data: any) {
  try {
    await prisma.materialHistory.create({
      data,
    });
    revalidatePath("/admin/laporan-bahan");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add material history:", error);
    return { success: false, error: error.message };
  }
}
