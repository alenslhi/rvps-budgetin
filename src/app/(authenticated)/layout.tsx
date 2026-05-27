import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import Sidebar from "@/components/Sidebar";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden">
      {/* Shared Top Navbar */}
      <Sidebar user={session.user} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] mt-14 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
