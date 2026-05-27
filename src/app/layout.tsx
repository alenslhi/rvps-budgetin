import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spendora - Personal Finance",
  description: "Spendora merupakan aplikasi manajemen keuangan pribadi yang dirancang untuk membantu pengguna dalam mencatat, memantau, dan mengelola kondisi finansial secara efektif.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-gray-100 transition-colors duration-500">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
