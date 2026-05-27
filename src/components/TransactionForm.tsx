"use client";

import React, { useState, useRef } from "react";
import { recordTransaction } from "@/lib/actions";
import { Check, Info } from "lucide-react";

import { Category, Subcategory } from "@/types";

interface TransactionFormCategory extends Omit<Category, "subcategories"> {
  subcategories: (Subcategory & {
    remainingBalance: number;
  })[];
}

interface TransactionFormProps {
  categories: TransactionFormCategory[];
}

export default function TransactionForm({ categories }: TransactionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const subcategoryId = formData.get("subcategory_id") as string;

    if (!subcategoryId) {
      setError("Pilih Kebutuhan terlebih dahulu");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Harga pengeluaran harus diisi dengan angka valid");
      return;
    }

    setLoading(true);

    try {
      const res = await recordTransaction(null, formData);
      if (res && !res.success) {
        setError(res.error || "Gagal mencatat pengeluaran");
      } else {
        setSuccess(res.message || "Pengeluaran berhasil dicatat!");
        formRef.current?.reset();
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mencatat pengeluaran";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="premium-card p-6">
      <h2 className="text-base font-extrabold mb-4 border-b border-brand-border pb-3 text-brand-primary tracking-tighter">
        Catat Belanja Harian
      </h2>

      {success && (
        <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 mb-5 p-3.5 rounded-lg font-bold text-xs flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-500 mb-5 p-3.5 rounded-lg font-bold text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Alokasi Sekat Kebutuhan
          </label>
          <div className="relative">
            <select
              name="subcategory_id"
              className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold cursor-pointer transition-colors"
              required
              disabled={loading}
            >
              <option value="" className="bg-card-bg">
                Pilih Alokasi Dana
              </option>
              {categories.map((cat) => (
                <optgroup
                  key={cat.id}
                  label={cat.name}
                  className="font-extrabold bg-transparent text-brand-primary"
                >
                  {cat.subcategories.map((sub) => (
                    <option
                      key={sub.id}
                      value={sub.id}
                      className="font-semibold bg-card-bg text-brand-primary"
                    >
                      {sub.name} (Sisa Saldo: Rp {sub.remainingBalance.toLocaleString("id-ID")})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Jumlah Nominal (Rp)
          </label>
          <input
            type="number"
            name="amount"
            placeholder="Contoh: 50000"
            className="w-full text-sm font-semibold bg-transparent border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-brand-primary transition-colors"
            required
            disabled={loading}
            min="1"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Keterangan Belanja <span className="text-[10px] font-medium text-brand-muted">(Opsional)</span>
          </label>
          <input
            type="text"
            name="description"
            placeholder="Contoh: Beli beras 5kg..."
            className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold transition-colors"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Tanggal Transaksi
          </label>
          <input
            type="date"
            name="date"
            defaultValue={today}
            className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold cursor-pointer transition-colors"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-hover text-brand-dark font-extrabold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6 text-xs"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </button>
      </form>
    </div>
  );
}
