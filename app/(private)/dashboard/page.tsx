"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  useEffect(() => {
    console.log("User in dashboard:", user);
  }, [user]);
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Dashboard - Área Privada {user?.name && `(${user.name})`}
      </h1>
    </main>
  );
}
