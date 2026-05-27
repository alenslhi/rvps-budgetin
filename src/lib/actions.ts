"use server";

import { authOptions, getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Zod schemas for input validation
const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email salah"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

const CategorySchema = z.object({
  name: z.string().min(1, "Nama Kapsul tidak boleh kosong"),
  budgetLimit: z.coerce.number().min(0, "Limit tidak boleh negatif"),
});

const SubcategorySchema = CategorySchema.extend({
  categoryId: z.string().min(1, "Kapsul Utama wajib dipilih"),
});

const TransactionSchema = z.object({
  subcategoryId: z.string().min(1, "Kebutuhan wajib dipilih"),
  amount: z.coerce.number().min(1, "Harga minimal Rp 1"),
  description: z.string().max(255).optional().default("-"),
  date: z.string().min(1, "Tanggal wajib diisi"),
});

// 1. REGISTER USER
export async function registerUser(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = RegisterSchema.parse(rawData);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message = error instanceof Error ? error.message : "Gagal mendaftarkan akun";
    return { success: false, error: message };
  }
}

// 2. CREATE CATEGORY (Kapsul Utama)
export async function createCategory(prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    const validatedData = CategorySchema.parse({
      name: formData.get("name"),
      budgetLimit: formData.get("budget_limit"),
    });

    await prisma.category.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        budgetLimit: validatedData.budgetLimit,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/manage");
    return { success: true, message: "Kapsul Utama baru berhasil dibuat!" };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message = error instanceof Error ? error.message : "Gagal membuat Kapsul Utama";
    return { success: false, error: message };
  }
}

// 3. DELETE CATEGORY
export async function deleteCategory(id: string) {
  try {
    const user = await getAuthenticatedUser();
    
    // Verify ownership
    const category = await prisma.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!category) {
      return { success: false, error: "Kapsul tidak ditemukan atau bukan milik Anda" };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/manage");
    return { success: true, message: "Kapsul beserta seluruh isinya berhasil dihapus!" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus Kapsul Utama";
    return { success: false, error: message };
  }
}

// 4. CREATE SUBCATEGORY (Sekat Kebutuhan)
export async function createSubcategory(prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    const validatedData = SubcategorySchema.parse({
      categoryId: formData.get("category_id"),
      name: formData.get("name"),
      budgetLimit: formData.get("budget_limit"),
    });

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: validatedData.categoryId, userId: user.id },
      include: { subcategories: true },
    });

    if (!category) {
      return { success: false, error: "Kapsul Utama tidak ditemukan atau bukan milik Anda" };
    }

    // Calculate total allocated subcategory budget
    const totalSubLimit = category.subcategories.reduce(
      (sum, s) => sum + Number(s.budgetLimit),
      0
    );
    const remainingLimit = Number(category.budgetLimit) - totalSubLimit;

    if (validatedData.budgetLimit > remainingLimit) {
      return {
        success: false,
        error: `Limit sekat baru (Rp ${validatedData.budgetLimit.toLocaleString("id-ID")}) melebihi sisa kapasitas Kapsul Utama yang tersedia (Sisa tersedia: Rp ${remainingLimit.toLocaleString("id-ID")}).`,
      };
    }

    await prisma.subcategory.create({
      data: {
        categoryId: validatedData.categoryId,
        name: validatedData.name,
        budgetLimit: validatedData.budgetLimit,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/manage");
    return { success: true, message: "Kebutuhan baru berhasil ditambahkan!" };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message = error instanceof Error ? error.message : "Gagal membuat Sekat Kebutuhan";
    return { success: false, error: message };
  }
}

// 5. DELETE SUBCATEGORY
export async function deleteSubcategory(id: string) {
  try {
    const user = await getAuthenticatedUser();
    
    // Verify ownership via category
    const subcategory = await prisma.subcategory.findFirst({
      where: { id, category: { userId: user.id } },
    });

    if (!subcategory) {
      return { success: false, error: "Kebutuhan tidak ditemukan atau bukan milik Anda" };
    }

    await prisma.subcategory.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/manage");
    return { success: true, message: "Kebutuhan berhasil dihapus!" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus kebutuhan";
    return { success: false, error: message };
  }
}

// 6. RECORD TRANSACTION (Catat Pengeluaran)
export async function recordTransaction(prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    const validatedData = TransactionSchema.parse({
      subcategoryId: formData.get("subcategory_id"),
      amount: formData.get("amount"),
      description: formData.get("description") || "-",
      date: formData.get("date"),
    });

    // Verify subcategory belongs to user
    const subcategory = await prisma.subcategory.findFirst({
      where: { id: validatedData.subcategoryId, category: { userId: user.id } },
    });

    if (!subcategory) {
      return { success: false, error: "Kebutuhan tidak ditemukan atau bukan milik Anda" };
    }

    await prisma.transaction.create({
      data: {
        subcategoryId: validatedData.subcategoryId,
        amount: validatedData.amount,
        description: validatedData.description,
        date: new Date(validatedData.date),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");
    return { success: true, message: "Pengeluaran berhasil dicatat!" };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message = error instanceof Error ? error.message : "Gagal mencatat pengeluaran";
    return { success: false, error: message };
  }
}

// 7. DELETE TRANSACTION
export async function deleteTransaction(id: string) {
  try {
    const user = await getAuthenticatedUser();

    // Verify ownership via subcategory -> category
    const transaction = await prisma.transaction.findFirst({
      where: { id, subcategory: { category: { userId: user.id } } },
    });

    if (!transaction) {
      return { success: false, error: "Catatan pengeluaran tidak ditemukan atau bukan milik Anda" };
    }

    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");
    return { success: true, message: "Catatan pengeluaran dihapus, saldo kembali!" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus transaksi";
    return { success: false, error: message };
  }
}

// 8. BULK UPDATE CATEGORIES & SUBCATEGORIES
export async function updateBulk(data: {
  categories: Record<string, { name: string; budgetLimit: number }>;
  subcategories: Record<string, { name: string; budgetLimit: number }>;
}) {
  try {
    const user = await getAuthenticatedUser();

    await prisma.$transaction(async (tx) => {
      // Fetch current categories and subcategories to perform validation on target allocations
      const allUserCategories = await tx.category.findMany({
        where: { userId: user.id },
        include: { subcategories: true },
      });

      // Validate that total subcategory budget doesn't exceed category budget
      for (const category of allUserCategories) {
        const newCatLimit = data.categories?.[category.id] !== undefined
          ? Number(data.categories[category.id].budgetLimit)
          : Number(category.budgetLimit);

        let totalSubLimit = 0;
        for (const sub of category.subcategories) {
          const newSubLimit = data.subcategories?.[sub.id] !== undefined
            ? Number(data.subcategories[sub.id].budgetLimit)
            : Number(sub.budgetLimit);
          totalSubLimit += newSubLimit;
        }

        if (totalSubLimit > newCatLimit) {
          throw new Error(
            `Total limit sekat kebutuhan pada Kapsul "${category.name}" (Rp ${totalSubLimit.toLocaleString("id-ID")}) melebihi limit Kapsul Utama (Rp ${newCatLimit.toLocaleString("id-ID")})`
          );
        }
      }

      // Update Kapsul Utama
      if (data.categories) {
        for (const [id, catData] of Object.entries(data.categories)) {
          await tx.category.update({
            where: { id, userId: user.id },
            data: {
              name: catData.name,
              budgetLimit: catData.budgetLimit,
            },
          });
        }
      }

      // Update Sekat Kebutuhan
      if (data.subcategories) {
        for (const [id, subData] of Object.entries(data.subcategories)) {
          await tx.subcategory.update({
            where: { id, category: { userId: user.id } },
            data: {
              name: subData.name,
              budgetLimit: subData.budgetLimit,
            },
          });
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/manage");
    return { success: true, message: "Semua perubahan berhasil disimpan serentak!" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan perubahan massal";
    return { success: false, error: message };
  }
}
