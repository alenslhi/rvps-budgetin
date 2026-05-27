import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForms from "@/components/ProfileForms";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { createdAt: true },
  });

  const joinDate = dbUser?.createdAt
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(dbUser.createdAt)
    : "Baru saja";

  const user = {
    name: session.user.name || "",
    email: session.user.email || "",
    joinDate,
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent pb-24 relative z-10">
      <div className="p-4 lg:p-8 w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-brand-primary tracking-tighter mb-1">
            Pengaturan Akun
          </h2>
          <p className="text-xs text-brand-muted font-bold">
            Kelola detail profil Anda dan ubah kata sandi keamanan Anda.
          </p>
        </div>

        <ProfileForms user={user} />
      </div>
    </main>
  );
}
