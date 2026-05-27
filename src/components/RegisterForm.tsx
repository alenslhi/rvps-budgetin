"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/actions";
import { UserPlus, Info, Check } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Kata sandi konfirmasi tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const res = await registerUser(null, formData);

      if (res && !res.success) {
        setError(res.error || "Gagal membuat akun");
      } else {
        setSuccess("Akun berhasil dibuat! Mengalihkan ke halaman masuk...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card w-full max-w-md p-8">
      <div className="text-center mb-8 flex flex-col items-center">
        <h1 className="text-2xl font-extrabold text-brand-primary tracking-tighter mb-0.5">
          spend<span className="text-brand-muted font-normal">ora</span>
        </h1>
        <p className="text-[10px] text-brand-muted font-extrabold tracking-tight mb-3">
          Spend Wise, Live Better
        </p>
        <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">
          Daftar Akun Baru
        </p>
      </div>

      {error && (
        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-500 mb-6 p-3.5 rounded-lg font-bold text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 mb-6 p-3.5 rounded-lg font-bold text-xs flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-transparent border border-brand-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary font-semibold transition-colors"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Alamat Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full bg-transparent border border-brand-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary font-semibold transition-colors"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Kata Sandi
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full bg-transparent border border-brand-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary font-semibold transition-colors"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold opacity-80">
            Konfirmasi Kata Sandi
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi"
            className="w-full bg-transparent border border-brand-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary font-semibold transition-colors"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-hover text-brand-dark font-extrabold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6 text-sm"
          disabled={loading}
        >
          <UserPlus className="w-4 h-4" />
          {loading ? "Mendaftarkan..." : "Daftar Akun"}
        </button>
      </form>

      <div className="text-center mt-6 border-t border-brand-border pt-6">
        <p className="text-xs font-semibold text-brand-muted">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-brand-primary font-extrabold hover:underline"
          >
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
