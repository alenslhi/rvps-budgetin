"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Moon, Sun, LogOut, User, Home, Clock, Wallet } from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
    },
    {
      name: "Riwayat",
      href: "/history",
    },
    {
      name: "Kapsul",
      href: "/manage",
    },
  ];

  const mobileNavItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Riwayat",
      href: "/history",
      icon: Clock,
    },
    {
      name: "Kapsul",
      href: "/manage",
      icon: Wallet,
    },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-14 bg-card-bg border-b border-brand-border z-50 flex items-center justify-between px-4 lg:px-8">
        {/* Left side: Brand Title */}
        <div className="flex items-center">
          <Link href="/dashboard" className="text-base font-extrabold text-brand-primary tracking-tighter">
            budget<span className="text-brand-muted font-normal">In</span>
          </Link>
        </div>

        {/* Middle side: Navigation pills (hidden on mobile, visible on desktop) */}
        <nav className="hidden md:flex bg-brand-border/20 dark:bg-brand-border/40 p-1 rounded-full border border-brand-border/20 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-card-bg text-brand-primary border border-brand-border/25"
                    : "text-brand-muted hover:text-brand-primary"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Icon */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-brand-muted hover:text-brand-primary transition-colors cursor-pointer"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? (
                <Sun className="w-4.5 h-4.5" />
              ) : (
                <Moon className="w-4.5 h-4.5" />
              )}
            </button>
          )}

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full bg-brand-border/40 hover:bg-brand-border/60 border border-brand-border flex items-center justify-center font-extrabold text-xs text-brand-primary transition-colors cursor-pointer"
            >
              {user.name ? user.name[0].toUpperCase() : "U"}
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-brand-border rounded-lg py-1.5 z-40">
                  <div className="px-4 py-2 border-b border-brand-border">
                    <p className="text-xs font-bold text-brand-primary truncate">{user.name || "User"}</p>
                    <p className="text-[10px] font-semibold text-brand-muted truncate">{user.email || ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-bold text-brand-primary hover:bg-brand-border/30 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profil Akun
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (confirm("Yakin ingin keluar?")) {
                        signOut({ callbackUrl: "/login" });
                      }
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile View */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-card-bg border-t border-brand-border z-50 flex items-center justify-around px-4 pb-safe">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-all duration-200 ${
                isActive
                  ? "text-brand-primary font-bold"
                  : "text-brand-muted hover:text-brand-primary font-semibold"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "stroke-[2.2] scale-110" : "stroke-[1.8]"}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
