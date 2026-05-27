"use client";

import React, { useState, useEffect } from "react";
import {
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
  updateBulk,
} from "@/lib/actions";
import { Trash2, Save, Info, Check, AlertTriangle } from "lucide-react";

import { Category } from "@/types";

interface ManageCapsulesProps {
  initialCategories: Category[];
}

export default function ManageCapsules({ initialCategories }: ManageCapsulesProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  const [editedCategories, setEditedCategories] = useState<Record<string, { name: string; budgetLimit: number }>>({});
  const [editedSubcategories, setEditedSubcategories] = useState<Record<string, { name: string; budgetLimit: number }>>({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleCategoryNameChange = (id: string, name: string) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, name } : c))
    );
    setEditedCategories(prev => ({
      ...prev,
      [id]: { name, budgetLimit: prev[id]?.budgetLimit ?? Number(categories.find(c => c.id === id)?.budgetLimit || 0) }
    }));
  };

  const handleCategoryLimitChange = (id: string, budgetLimit: number) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, budgetLimit } : c))
    );
    setEditedCategories(prev => ({
      ...prev,
      [id]: { name: prev[id]?.name ?? (categories.find(c => c.id === id)?.name || ""), budgetLimit }
    }));
  };

  const handleSubcategoryNameChange = (id: string, catId: string, name: string) => {
    setCategories(prev =>
      prev.map(c =>
        c.id === catId
          ? {
              ...c,
              subcategories: c.subcategories.map(s => (s.id === id ? { ...s, name } : s)),
            }
          : c
      )
    );
    setEditedSubcategories(prev => ({
      ...prev,
      [id]: {
        name,
        budgetLimit: prev[id]?.budgetLimit ?? Number(categories.flatMap(c => c.subcategories).find(s => s.id === id)?.budgetLimit || 0),
      },
    }));
  };

  const handleSubcategoryLimitChange = (id: string, catId: string, budgetLimit: number) => {
    setCategories(prev =>
      prev.map(c =>
        c.id === catId
          ? {
              ...c,
              subcategories: c.subcategories.map(s => (s.id === id ? { ...s, budgetLimit } : s)),
            }
          : c
      )
    );
    setEditedSubcategories(prev => ({
      ...prev,
      [id]: {
        name: prev[id]?.name ?? (categories.flatMap(c => c.subcategories).find(s => s.id === id)?.name || ""),
        budgetLimit,
      },
    }));
  };

  const handleSaveBulk = async () => {
    // Client-side validation check
    const hasLimitError = categories.some((c) => {
      const totalSub = c.subcategories.reduce((sum, s) => sum + s.budgetLimit, 0);
      return totalSub > c.budgetLimit;
    });

    if (hasLimitError) {
      setMessage({
        type: "error",
        text: "Gagal menyimpan: Terdapat alokasi Sekat Kebutuhan yang melebihi limit Kapsul Utama",
      });
      return;
    }

    if (Object.keys(editedCategories).length === 0 && Object.keys(editedSubcategories).length === 0) {
      setMessage({ type: "error", text: "Belum ada perubahan yang dilakukan" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await updateBulk({
        categories: editedCategories,
        subcategories: editedSubcategories,
      });

      if (res.success) {
        setMessage({ type: "success", text: res.message || "Semua perubahan berhasil disimpan serentak!" });
        setEditedCategories({});
        setEditedSubcategories({});
      } else {
        setMessage({ type: "error", text: res.error || "Gagal menyimpan perubahan massal" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
      setMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("BAHAYA: Menghapus kapsul ini akan menghapus SEMUA isinya beserta transaksinya. Yakin?")) {
      setLoading(true);
      try {
        const res = await deleteCategory(id);
        if (res.success) {
          setMessage({ type: "success", text: res.message || "Kapsul berhasil dihapus!" });
          const newEditedCats = { ...editedCategories };
          delete newEditedCats[id];
          setEditedCategories(newEditedCats);
        } else {
          setMessage({ type: "error", text: res.error || "Gagal menghapus Kapsul" });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus";
        setMessage({ type: "error", text: message });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (confirm("Yakin mau hapus sekat ini?")) {
      setLoading(true);
      try {
        const res = await deleteSubcategory(id);
        if (res.success) {
          setMessage({ type: "success", text: res.message || "Kebutuhan berhasil dihapus!" });
          const newEditedSubs = { ...editedSubcategories };
          delete newEditedSubs[id];
          setEditedSubcategories(newEditedSubs);
        } else {
          setMessage({ type: "error", text: res.error || "Gagal menghapus kebutuhan" });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus";
        setMessage({ type: "error", text: message });
      } finally {
        setLoading(false);
      }
    }
  };

  // Determine if there is any validation error currently
  const hasLimitError = categories.some((c) => {
    const totalSub = c.subcategories.reduce((sum, s) => sum + s.budgetLimit, 0);
    return totalSub > c.budgetLimit;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Alert Banner */}
      {message && (
        <div
          className={`border p-3.5 rounded-lg font-bold text-xs flex items-center gap-2.5 ${
            message.type === "success"
              ? "bg-green-500/5 dark:bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
              : "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.type === "success" ? <Check className="w-4 h-4 text-green-500" /> : <Info className="w-4 h-4 text-red-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Add New Category */}
      <div className="premium-card p-6">
        <h3 className="font-extrabold text-sm mb-4 text-brand-primary tracking-tighter">
          Bikin Kapsul Utama Baru (Contoh: Cicilan, Liburan)
        </h3>
        <form
          action={async (formData) => {
            setLoading(true);
            setMessage(null);
            const res = await createCategory(null, formData);
            if (res.success) {
              setMessage({ type: "success", text: res.message || "" });
              const form = document.getElementById("create-cat-form") as HTMLFormElement;
              form?.reset();
            } else {
              setMessage({ type: "error", text: res.error || "" });
            }
            setLoading(false);
          }}
          id="create-cat-form"
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            name="name"
            placeholder="Nama Kapsul..."
            className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold"
            required
            disabled={loading}
          />
          <input
            type="number"
            name="budget_limit"
            placeholder="Total Limit (Rp)"
            className="w-full sm:w-1/3 bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-brand-primary hover:bg-brand-hover text-brand-dark px-6 py-2.5 rounded-lg font-extrabold text-xs transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            Buat Kapsul
          </button>
        </form>
      </div>

      {/* 2. Categories & Subcategories Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {categories.map((category) => {
          const totalAllocated = category.subcategories.reduce((sum, s) => sum + s.budgetLimit, 0);
          const remainingAllocatable = category.budgetLimit - totalAllocated;

          return (
            <div
              key={category.id}
              className={`premium-card p-6 flex flex-col relative hover:border-brand-primary/40 ${
                remainingAllocatable < 0 ? "border-red-500/40 dark:border-red-500/40" : ""
              }`}
            >
              {/* Delete Category Trigger */}
              <button
                onClick={() => handleDeleteCategory(category.id)}
                disabled={loading}
                className="absolute top-5 right-5 z-10 p-2 border border-brand-border text-red-500 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Hapus Kapsul Utama"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Category Edit Area */}
              <div className="mb-6 border-b border-brand-border pb-5 pr-10">
                <label className="text-[10px] font-bold text-brand-muted mb-1 block uppercase tracking-wide">
                  Nama Kapsul
                </label>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-brand-border focus:border-brand-primary focus:border-b outline-none font-bold text-base text-brand-primary mb-3.5 w-full transition-colors"
                  required
                  disabled={loading}
                />

                <label className="text-[10px] font-bold text-brand-muted mb-1 block uppercase tracking-wide">
                  Limit Total Kapsul (Rp)
                </label>
                <input
                  type="number"
                  value={category.budgetLimit}
                  onChange={(e) => handleCategoryLimitChange(category.id, Number(e.target.value))}
                  className="bg-transparent border border-brand-border rounded-lg p-2 text-xs font-bold w-full max-w-[200px] focus:outline-none focus:border-brand-primary transition-colors"
                  required
                  disabled={loading}
                />

                {/* Remaining Allocatable Helper Label */}
                <div className="mt-3 p-2 bg-brand-border/10 rounded-lg border border-brand-border/40 text-[10px]">
                  <p className="font-semibold text-brand-muted">
                    Total Dialokasikan ke Sekat: <span className="font-bold text-brand-primary">Rp {totalAllocated.toLocaleString("id-ID")}</span>
                  </p>
                  <p className="mt-0.5 font-semibold text-brand-muted">
                    Sisa Limit yang Bisa Diisi:{" "}
                    <span
                       className={`font-bold ${
                        remainingAllocatable < 0 ? "text-red-500 font-extrabold" : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      Rp {remainingAllocatable.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>
              </div>

              {/* 3. Add Subcategory Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const targetForm = e.currentTarget;
                  const formData = new FormData(targetForm);
                  const limit = Number(formData.get("budget_limit"));

                  if (limit > remainingAllocatable) {
                    setMessage({
                      type: "error",
                      text: `Input Ditolak: Limit sekat baru (Rp ${limit.toLocaleString("id-ID")}) melebihi sisa kapasitas Kapsul Utama (Sisa: Rp ${remainingAllocatable.toLocaleString("id-ID")}).`,
                    });
                    return;
                  }

                  setLoading(true);
                  setMessage(null);
                  const res = await createSubcategory(null, formData);
                  if (res.success) {
                    setMessage({ type: "success", text: res.message || "" });
                    targetForm.reset();
                  } else {
                    setMessage({ type: "error", text: res.error || "" });
                  }
                  setLoading(false);
                }}
                id={`sub-form-${category.id}`}
                className="flex flex-col sm:flex-row gap-2 mb-6 bg-brand-border/10 p-3 rounded-lg border border-brand-border"
              >
                <input type="hidden" name="category_id" value={category.id} />
                <input
                  type="text"
                  name="name"
                  placeholder="Isi/Sekat Baru..."
                  className="w-full bg-transparent border-b border-transparent focus:border-brand-primary outline-none text-xs p-1 font-semibold"
                  required
                  disabled={loading}
                />
                <input
                  type="number"
                  name="budget_limit"
                  placeholder="Limit (Rp)"
                  className="w-full sm:w-1/3 bg-transparent border-b border-transparent focus:border-brand-primary outline-none text-xs p-1 font-semibold"
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-hover text-brand-dark px-3 py-1.5 rounded-lg font-bold text-[10px] shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                  disabled={loading || remainingAllocatable <= 0}
                  title={remainingAllocatable <= 0 ? "Kapasitas limit penuh" : "Tambah sekat"}
                >
                  + Tambah
                </button>
              </form>

              {/* 4. Subcategories List */}
              <div className="space-y-3 flex-1">
                {category.subcategories.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-4 bg-brand-border/10 rounded-lg">
                    Belum ada sekat di kapsul ini.
                  </p>
                ) : (
                  category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className={`bg-transparent border p-3 rounded-lg flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center transition-colors ${
                        remainingAllocatable < 0
                          ? "border-red-500/20 hover:border-red-500/40"
                          : "border-brand-border hover:border-brand-primary/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleSubcategoryNameChange(sub.id, category.id, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-brand-border focus:border-brand-primary focus:border-b outline-none text-xs p-0.5 font-bold text-brand-primary transition-colors"
                          required
                          disabled={loading}
                        />
                        <div className="flex items-center gap-1 w-full sm:w-1/2">
                          <span className="text-[10px] font-bold text-brand-muted">Rp</span>
                          <input
                            type="number"
                            value={sub.budgetLimit}
                            onChange={(e) => handleSubcategoryLimitChange(sub.id, category.id, Number(e.target.value))}
                            className="w-full bg-transparent border-b border-transparent hover:border-brand-border focus:border-brand-primary focus:border-b outline-none text-xs p-0.5 font-mono font-bold text-brand-primary transition-colors"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        disabled={loading}
                        className="text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 px-2 py-1 rounded text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Save Actions Bar at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card-bg/85 backdrop-blur-md border-t border-brand-border z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
            {hasLimitError && (
              <>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Alokasi sekat melebihi limit Kapsul Utama! Perbaiki sebelum menyimpan.</span>
              </>
            )}
          </div>
          
          <button
            onClick={handleSaveBulk}
            disabled={loading || hasLimitError || (Object.keys(editedCategories).length === 0 && Object.keys(editedSubcategories).length === 0)}
            className="bg-brand-primary hover:bg-brand-hover text-brand-dark font-extrabold py-2.5 px-6 rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Semua Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
