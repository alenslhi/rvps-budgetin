"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface HistoryFilterProps {
  currentMonth: string;
  currentYear: string;
}

export default function HistoryFilter({ currentMonth, currentYear }: HistoryFilterProps) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const daftarBulan = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const tahunSekarang = new Date().getFullYear();
  const daftarTahun = Array.from({ length: 4 }, (_, i) => (tahunSekarang - 1 + i).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/history?month=${month}&year=${year}`);
  };

  return (
    <div className="premium-card p-5 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full">
          <label className="block text-xs font-bold opacity-80 mb-1.5 ml-0.5">Filter Bulan</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary appearance-none font-semibold cursor-pointer transition-colors"
          >
            {daftarBulan.map((b) => (
              <option key={b.value} value={b.value} className="bg-card-bg text-brand-primary">
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block text-xs font-bold opacity-80 mb-1.5 ml-0.5">Filter Tahun</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary appearance-none font-semibold cursor-pointer transition-colors"
          >
            {daftarTahun.map((y) => (
              <option key={y} value={y} className="bg-card-bg text-brand-primary">
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-brand-primary hover:bg-brand-hover text-brand-dark px-6 py-2.5 rounded-lg font-extrabold text-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          Tampilkan Data
        </button>
      </form>
    </div>
  );
}
