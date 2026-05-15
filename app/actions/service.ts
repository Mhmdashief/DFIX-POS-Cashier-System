"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getServices() {
  try {
    return await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

export async function saveServiceAction(data: any, id?: string) {
  try {
    if (id) {
      await prisma.service.update({
        where: { id },
        data,
      });
    } else {
      await prisma.service.create({
        data,
      });
    }
    revalidatePath("/admin/data-reparasi");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save service:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/data-reparasi");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete service:", error);
    return { success: false, error: error.message };
  }
}
