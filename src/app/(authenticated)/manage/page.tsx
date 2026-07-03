import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ManageCapsules from "@/components/ManageCapsules";

interface ManagePageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const month = resolvedSearchParams.month || (new Date().getMonth() + 1).toString().padStart(2, "0");
  const year = resolvedSearchParams.year || new Date().getFullYear().toString();

  // Fetch categories and subcategories for the user in the selected month and year
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    },
    include: {
      subcategories: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Serialize Decimals for safe transfer to client component
  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    budgetLimit: Number(cat.budgetLimit),
    subcategories: cat.subcategories.map((sub) => ({
      id: sub.id,
      categoryId: sub.categoryId,
      name: sub.name,
      budgetLimit: Number(sub.budgetLimit),
    })),
  }));

  return (
    <main className="flex-1 flex flex-col overflow-y-auto bg-transparent pb-36 md:pb-20 relative z-10">
      <div className="p-4 lg:p-8 w-full max-w-5xl mx-auto flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-brand-primary tracking-tighter mb-1">
            Pengaturan Kapsul
          </h2>
          <p className="text-xs text-brand-muted font-bold">
            Buat, ubah nama, atau atur limit Kapsul Utamamu dengan bebas.
          </p>
        </div>

        <ManageCapsules
          initialCategories={formattedCategories}
          currentMonth={month}
          currentYear={year}
        />
      </div>
    </main>
  );
}
