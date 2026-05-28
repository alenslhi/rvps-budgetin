"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Info, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card w-full max-w-md p-8">
      <div className="text-center mb-8 flex flex-col items-center">
        <h1 className="text-2xl font-extrabold text-brand-primary tracking-tighter mb-0.5">
          budget<span className="text-brand-muted font-normal">In</span>
        </h1>
        <p className="text-[10px] text-brand-muted font-extrabold tracking-tight mb-3">
          Control Every Rupiah
        </p>
        <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">
          Masuk ke Akun Anda
        </p>
      </div>

      {error && (
        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-500 mb-6 p-3.5 rounded-lg font-bold text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent border border-brand-border rounded-lg pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-primary font-semibold transition-colors"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary focus:outline-none transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4.5 h-4.5" />
              ) : (
                <Eye className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-hover text-brand-dark font-extrabold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6 text-sm"
          disabled={loading}
        >
          <LogIn className="w-4 h-4" />
          {loading ? "Menghubungkan..." : "Masuk"}
        </button>
      </form>

      <div className="text-center mt-6 border-t border-brand-border pt-6">
        <p className="text-xs font-semibold text-brand-muted">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-brand-primary font-extrabold hover:underline"
          >
            Daftar Gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
