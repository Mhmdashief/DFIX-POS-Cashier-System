"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { id: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function saveUserAction(data: any, id?: string) {
  try {
    const userData = { ...data };
    
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    } else {
      delete userData.password;
    }

    if (userData.username) {
      userData.username = userData.username.toLowerCase();
    }

    if (userData.status) userData.status = userData.status as Status;

    if (id) {
      await prisma.user.update({
        where: { id },
        data: userData,
      });
    } else {
      await prisma.user.create({
        data: userData,
      });
    }
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save user:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error.message };
  }
}

import { Status } from "@prisma/client";

export async function updateUserStatusAction(id: string, status: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { status: status as Status },
    });
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user status:", error);
    return { success: false, error: error.message };
  }
}
