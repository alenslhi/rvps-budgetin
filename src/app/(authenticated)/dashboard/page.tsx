import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TransactionForm from "@/components/TransactionForm";

interface DashboardPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const month = resolvedSearchParams.month || (new Date().getMonth() + 1).toString().padStart(2, "0");
  const year = resolvedSearchParams.year || new Date().getFullYear().toString();

  const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
  const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: {
      subcategories: {
        include: {
          transactions: {
            where: {
              date: {
                gte: startDate,
                lt: endDate,
              },
            },
          },
        },
      },
    },
  });

  const formattedCategories = categories.map((cat) => {
    const subcategoriesWithBalance = cat.subcategories.map((sub) => {
      const totalUsed = sub.transactions.reduce((sum, trx) => sum + Number(trx.amount), 0);
      const remainingBalance = Number(sub.budgetLimit) - totalUsed;
      return {
        id: sub.id,
        categoryId: cat.id,
        name: sub.name,
        budgetLimit: Number(sub.budgetLimit),
        remainingBalance,
        totalUsed,
        percentageUsed: Number(sub.budgetLimit) > 0 ? (totalUsed / Number(sub.budgetLimit)) * 100 : 0,
      };
    });

    const categoryTotalLimit = Number(cat.budgetLimit);
    const categoryTotalUsed = subcategoriesWithBalance.reduce((sum, sub) => sum + sub.totalUsed, 0);
    const categoryRemainingBalance = categoryTotalLimit - categoryTotalUsed;

    return {
      id: cat.id,
      name: cat.name,
      budgetLimit: categoryTotalLimit,
      remainingBalance: categoryRemainingBalance,
      subcategories: subcategoriesWithBalance,
    };
  });

  const monthsNames: Record<string, string> = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember",
  };

  const currentPeriodName = `${monthsNames[month] || "Bulan"} ${year}`;

  const totalSisaKapsul = formattedCategories.reduce((sum, cat) => sum + cat.remainingBalance, 0);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent relative z-10">
      <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto">
        {/* Welcome & Sisa Kapsul Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-8">
          <div>
            <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
              PERIODE {currentPeriodName.toUpperCase()}
            </p>
            <h2 className="text-3xl font-extrabold text-brand-primary tracking-tighter">
              Halo, {session.user.name || "User"}.
            </h2>
          </div>
          <div className="md:text-right">
            <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
              Total Sisa Kapsul
            </p>
            <p className="text-2xl font-extrabold text-brand-primary tracking-tighter">
              Rp {totalSisaKapsul.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Log Transaction */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-8">
              <TransactionForm categories={formattedCategories} />
            </div>
          </div>

          {/* Right Column: Capsules Status */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-brand-primary tracking-tighter">
                Status Anggaran Kapsul
              </h2>
              <span className="text-xs font-bold border border-brand-border px-3.5 py-1.5 rounded-lg text-brand-muted">
                Periode: {currentPeriodName}
              </span>
            </div>

            {formattedCategories.length === 0 ? (
              <div className="premium-card text-center py-16 opacity-75">
                <p className="font-bold text-sm text-brand-primary">Belum ada Kapsul Utama.</p>
                <p className="text-xs text-brand-muted mt-1">
                  Silakan buat kapsul baru di halaman Kelola Kapsul terlebih dahulu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {formattedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="premium-card p-6 flex flex-col h-full hover:border-brand-primary/40"
                  >
                    {/* Category Title & Sisa Balance */}
                    <div className="flex justify-between items-start border-b border-brand-border pb-3.5 mb-4">
                      <div>
                        <h3 className="font-extrabold text-base text-brand-primary truncate max-w-[150px] sm:max-w-[200px]">
                          {category.name}
                        </h3>
                        <p className="text-[10px] font-bold text-brand-muted mt-0.5">
                          Limit: Rp {category.budgetLimit.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-brand-muted mb-0.5 uppercase tracking-wide">
                          Sisa Kapsul
                        </p>
                        <span
                          className={`text-lg font-extrabold tracking-tight ${
                            category.remainingBalance < 0
                              ? "text-red-500"
                              : "text-brand-primary"
                          }`}
                        >
                          Rp {category.remainingBalance.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Subcategories (Sekat) Display */}
                    <div className="space-y-3.5 flex-1">
                      {category.subcategories.length === 0 ? (
                        <p className="text-xs font-semibold text-brand-muted text-center py-3">
                          Belum ada sekat kebutuhan.
                        </p>
                      ) : (
                        category.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-transparent border border-brand-border p-3.5 rounded-lg flex flex-col hover:border-brand-primary/30 transition-colors"
                          >
                            <div className="flex flex-col gap-0.5 mb-2.5">
                              <span className="font-bold text-[13px] text-brand-primary">
                                {sub.name}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-brand-muted">
                                <span>
                                  Limit: Rp {sub.budgetLimit.toLocaleString("id-ID")}
                                </span>
                                <span className="opacity-30">•</span>
                                <span>
                                  Terpakai: Rp {sub.totalUsed.toLocaleString("id-ID")}
                                </span>
                                <span className="opacity-30">•</span>
                                <span
                                  className={
                                    sub.remainingBalance < 0
                                      ? "text-red-500 font-extrabold"
                                      : "text-brand-primary font-bold"
                                  }
                                >
                                  Sisa: Rp {sub.remainingBalance.toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-brand-border/60 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  sub.percentageUsed > 100
                                    ? "bg-red-500"
                                    : "bg-brand-primary"
                                }`}
                                style={{
                                  width: `${sub.percentageUsed > 100 ? 100 : sub.percentageUsed}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
