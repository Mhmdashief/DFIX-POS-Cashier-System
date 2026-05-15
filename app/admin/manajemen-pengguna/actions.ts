"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function saveUserAction(formData: any, id?: string) {
  try {
    const data = { ...formData };
    if (data.username) data.username = data.username.toLowerCase();
    
    // Hash password if it's a new user or password is changed
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else if (id) {
      delete data.password;
    }

    if (data.status) data.status = data.status as Status;

    if (id) {
      await prisma.user.update({
        where: { id },
        data,
      });
    } else {
      await prisma.user.create({
        data,
      });
    }
    revalidatePath("/admin/manajemen-pengguna");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save user:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/manajemen-pengguna");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error.message };
  }
}

import { Status } from "@prisma/client";

export async function updateStatusAction(id: string, newStatus: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { status: newStatus as Status },
    });
    revalidatePath("/admin/manajemen-pengguna");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message };
  }
}
