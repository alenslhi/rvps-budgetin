"use client";

import React, { useState } from "react";
import { updateProfile, updatePassword, deleteAccount } from "@/lib/profileActions";
import { signOut } from "next-auth/react";
import { Save, ShieldAlert, KeyRound, UserRound, Check, Info, Eye, EyeOff } from "lucide-react";

interface ProfileFormsProps {
  user: {
    name: string;
    email: string;
    joinDate?: string;
  };
}

export default function ProfileForms({ user }: ProfileFormsProps) {
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteConfirmPassword, setShowDeleteConfirmPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", profileName);
      formData.append("email", profileEmail);

      const res = await updateProfile(null, formData);
      if (res.success) {
        setProfileMsg({ type: "success", text: res.message || "Profil berhasil diperbarui!" });
      } else {
        setProfileMsg({ type: "error", text: res.error || "Gagal memperbarui profil" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah profil";
      setProfileMsg({ type: "error", text: message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordLoading(true);

    try {
      const formData = new FormData();
      formData.append("current_password", currentPassword);
      formData.append("new_password", newPassword);

      const res = await updatePassword(null, formData);
      if (res.success) {
        setPasswordMsg({ type: "success", text: res.message || "Kata sandi berhasil diperbarui!" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordMsg({ type: "error", text: res.error || "Gagal memperbarui kata sandi" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah sandi";
      setPasswordMsg({ type: "error", text: message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteMsg(null);
    setDeleteLoading(true);

    try {
      const formData = new FormData();
      formData.append("password", deleteConfirmPassword);

      const res = await deleteAccount(null, formData);
      if (res.success) {
        signOut({ callbackUrl: "/login" });
      } else {
        setDeleteMsg(res.error || "Password verifikasi salah");
        setDeleteLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setDeleteMsg(message);
      setDeleteLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* Left Column: Summary Card */}
      <div className="md:col-span-1">
        <div className="premium-card p-6 flex flex-col items-center text-center">
          {/* Avatar squircle box */}
          <div className="w-20 h-20 rounded-2xl bg-brand-border/30 dark:bg-brand-border/40 flex items-center justify-center mb-4">
            <span className="text-3xl font-extrabold text-brand-primary/80">
              {profileName ? profileName[0].toUpperCase() : "U"}
            </span>
          </div>

          {/* User Name */}
          <h3 className="text-base font-extrabold text-brand-primary tracking-tighter mt-1">
            {profileName}
          </h3>

          {/* User Email */}
          <p className="text-xs font-semibold text-brand-muted mt-1.5 break-all">
            {profileEmail}
          </p>

          {/* Joined Since Box */}
          <div className="w-full bg-brand-border/15 dark:bg-brand-border/20 rounded-xl p-3.5 mt-5 text-left">
            <span className="text-[9px] font-extrabold text-brand-muted tracking-wider mb-1 block uppercase">
              BERGABUNG SEJAK
            </span>
            <span className="text-xs font-extrabold text-brand-primary tracking-tighter">
              {user.joinDate || "Baru saja"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Update Forms */}
      <div className="md:col-span-2 space-y-6">
        {/* 1. Profile Details Update Card */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-2.5 border-b border-brand-border pb-3.5 mb-5">
            <UserRound className="w-4.5 h-4.5 text-brand-primary" />
            <h3 className="text-sm font-extrabold text-brand-primary tracking-tighter">
              Informasi Profil
            </h3>
          </div>

          {profileMsg && (
            <div
              className={`border p-3 rounded-lg font-bold text-xs flex items-center gap-2.5 mb-5 ${
                profileMsg.type === "success"
                  ? "bg-green-500/5 dark:bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-red-500"
              }`}
            >
              {profileMsg.type === "success" ? <Check className="w-4 h-4 text-green-500" /> : <Info className="w-4 h-4 text-red-500" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold opacity-80 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold transition-colors"
                required
                disabled={profileLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold opacity-80 mb-1.5">Alamat Email</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-transparent border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold transition-colors"
                required
                disabled={profileLoading}
              />
            </div>

            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-hover text-brand-dark py-2 px-4 rounded-lg font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              disabled={profileLoading}
            >
              <Save className="w-3.5 h-3.5" />
              {profileLoading ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </div>

        {/* 2. Password Change Card */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-2.5 border-b border-brand-border pb-3.5 mb-5">
            <KeyRound className="w-4.5 h-4.5 text-brand-primary" />
            <h3 className="text-sm font-extrabold text-brand-primary tracking-tighter">
              Perbarui Kata Sandi
            </h3>
          </div>

          {passwordMsg && (
            <div
              className={`border p-3 rounded-lg font-bold text-xs flex items-center gap-2.5 mb-5 ${
                passwordMsg.type === "success"
                  ? "bg-green-500/5 dark:bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-red-500"
              }`}
            >
              {passwordMsg.type === "success" ? <Check className="w-4 h-4 text-green-500" /> : <Info className="w-4 h-4 text-red-500" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold opacity-80 mb-1.5">Kata Sandi Saat Ini</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-brand-border rounded-lg pl-2.5 pr-9 py-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold transition-colors"
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary focus:outline-none transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold opacity-80 mb-1.5">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-transparent border border-brand-border rounded-lg pl-2.5 pr-9 py-2.5 text-xs focus:outline-none focus:border-brand-primary font-semibold transition-colors"
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary focus:outline-none transition-colors cursor-pointer"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-hover text-brand-dark py-2 px-4 rounded-lg font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              disabled={passwordLoading}
            >
              <Save className="w-3.5 h-3.5" />
              {passwordLoading ? "Memperbarui..." : "Perbarui Kata Sandi"}
            </button>
          </form>
        </div>

        {/* 3. Account Deletion Card */}
        <div className="bg-red-500/5 dark:bg-red-500/10 p-6 rounded-xl border border-red-500/20">
          <div className="flex items-center gap-2.5 border-b border-red-500/20 pb-3.5 mb-4">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
            <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400 tracking-tighter">
              Hapus Akun Permanen
            </h3>
          </div>

          <p className="text-xs text-brand-muted mb-5 font-semibold leading-relaxed">
            Setelah akun Anda dihapus, semua data anggaran, Kapsul Utama, Sekat Kebutuhan, dan seluruh
            catatan transaksi akan dihapus secara permanen dari server database dan tidak dapat dipulihkan.
          </p>

          {!showDeleteModal ? (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Hapus Akun
            </button>
          ) : (
            <div className="bg-transparent p-4 rounded-lg border border-red-500/20 space-y-4">
              <h4 className="font-bold text-xs text-red-600 dark:text-red-400">Konfirmasi Penghapusan Permanen</h4>
              <p className="text-[10px] text-brand-muted font-bold">
                Silakan ketik kata sandi Anda untuk memverifikasi bahwa Anda ingin menghapus akun ini secara permanen.
              </p>

              {deleteMsg && (
                <div className="bg-red-500/5 border border-red-500/20 text-red-500 p-2.5 rounded-lg font-bold text-xs">
                  {deleteMsg}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="relative">
                  <input
                    type={showDeleteConfirmPassword ? "text" : "password"}
                    value={deleteConfirmPassword}
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    placeholder="Masukkan password Anda..."
                    className="w-full bg-transparent border border-red-500/20 rounded-lg pl-2.5 pr-9 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold transition-colors"
                    required
                    disabled={deleteLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmPassword(!showDeleteConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500/70 hover:text-red-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    {showDeleteConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer disabled:opacity-50"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Menghapus..." : "Iya, Hapus Akun Saya"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmPassword("");
                      setDeleteMsg(null);
                    }}
                    className="border border-brand-border hover:bg-brand-border/45 text-brand-primary px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer"
                    disabled={deleteLoading}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
