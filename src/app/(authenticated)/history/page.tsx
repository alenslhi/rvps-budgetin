import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HistoryFilter from "@/components/HistoryFilter";
import TransactionItem from "@/components/TransactionItem";

interface HistoryPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const month = resolvedSearchParams.month || (new Date().getMonth() + 1).toString().padStart(2, "0");
  const year = resolvedSearchParams.year || new Date().getFullYear().toString();

  const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
  const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

  const transactions = await prisma.transaction.findMany({
    where: {
      subcategory: {
        category: {
          userId: session.user.id,
        },
      },
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      subcategory: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
  });

  const formattedTransactions = transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    date: t.date,
    subcategory: {
      name: t.subcategory.name,
      category: {
        name: t.subcategory.category.name,
      },
    },
  }));

  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent pb-24 relative z-10">
      <div className="p-4 lg:p-8 w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-brand-primary tracking-tighter mb-1">
            Riwayat Pengeluaran
          </h2>
          <p className="text-xs text-brand-muted font-bold">Pantau semua catatan belanja Anda di sini.</p>
        </div>

        {/* Date Filter Card */}
        <HistoryFilter currentMonth={month} currentYear={year} />

        {/* Transactions list */}
        <div className="space-y-3.5">
          {formattedTransactions.length === 0 ? (
            <div className="premium-card text-center py-16 opacity-75">
              <svg
                className="w-10 h-10 mx-auto mb-3 text-brand-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="font-bold text-sm text-brand-primary">Belum ada catatan belanja di periode ini.</p>
            </div>
          ) : (
            formattedTransactions.map((trx) => (
              <TransactionItem key={trx.id} transaction={trx} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
