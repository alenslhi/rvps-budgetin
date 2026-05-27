"use client";

import React, { useState } from "react";
import { deleteTransaction } from "@/lib/actions";
import { Trash2 } from "lucide-react";

import { Transaction } from "@/types";

interface TransactionItemProps {
  transaction: Transaction & {
    subcategory: {
      name: string;
      category: {
        name: string;
      };
    };
  };
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Batalkan catatan belanja ini? Saldo kapsul akan pulih kembali.")) {
      setDeleting(true);
      try {
        const res = await deleteTransaction(transaction.id);
        if (res && !res.success) {
          alert(res.error || "Gagal menghapus transaksi");
          setDeleting(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus transaksi";
        alert(message);
        setDeleting(false);
      }
    }
  };

  const formatDate = (dateInput: Date) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={`premium-card p-4 flex justify-between items-center transition-all hover:border-brand-primary/40 ${deleting ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex-1 pr-4">
        <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider mb-0.5">
          {formatDate(transaction.date)}
        </p>
        <h3 className="font-bold text-sm text-brand-primary leading-snug">
          {transaction.description || "Tanpa Keterangan"}
        </h3>
        <p className="text-xs text-brand-muted font-semibold mt-0.5">
          {transaction.subcategory.category.name} &raquo; {transaction.subcategory.name}
        </p>
      </div>

      <div className="text-right flex items-center space-x-4 border-l border-brand-border pl-4">
        <span className="font-mono text-sm font-bold text-red-500 whitespace-nowrap">
          -Rp {Number(transaction.amount).toLocaleString("id-ID")}
        </span>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 border border-brand-border text-red-500 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Hapus Transaksi"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
