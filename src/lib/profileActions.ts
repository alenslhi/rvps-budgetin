"use server";

import { authOptions, getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email salah"),
});

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama harus diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

const DeleteAccountSchema = z.object({
  password: z.string().min(1, "Password verifikasi harus diisi"),
});

// 1. UPDATE PROFILE DETAILS
export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    const validatedData = ProfileSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
    });

    // Check if email is already used by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        NOT: { id: user.id },
      },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah digunakan oleh akun lain" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
      },
    });

    revalidatePath("/profile");
    return { success: true, message: "Informasi profil berhasil diperbarui!" };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message = error instanceof Error ? error.message : "Gagal memperbarui profil";
    return { success: false, error: message };
  }
}

// 2. UPDATE PASSWORD
export async function updatePassword(prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    const validatedData = PasswordSchema.parse({
      currentPassword: formData.get("current_password"),
      newPassword: formData.get("new_password"),
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Akun tidak ditemukan" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(validatedData.currentPassword, dbUser.password);
    if (!isValid) {
      return { success: false, error: "Kata sandi saat ini salah" };
    }

    // Update with new password
    const hashed = await bcrypt.hash(validatedData.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return { success: true, message: "Kata sandi berhasil diperbarui!" };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message = error instanceof Error ? error.message : "Gagal memperbarui kata sandi";
    return { success: false, error: message };
  }
}

// 3. DELETE ACCOUNT
export async function deleteAccount(prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    const validatedData = DeleteAccountSchema.parse({
      password: formData.get("password"),
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Akun tidak ditemukan" };
    }

    // Verify password
    const isValid = await bcrypt.compare(validatedData.password, dbUser.password);
    if (!isValid) {
      return { success: false, error: "Verifikasi kata sandi salah" };
    }

    // Delete user (Prisma cascade delete will remove categories, subcategories, transactions)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message = error instanceof Error ? error.message : "Gagal menghapus akun";
    return { success: false, error: message };
  }
}
