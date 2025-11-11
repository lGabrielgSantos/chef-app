"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useEffect} from "react";
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const t = useTranslations('dashboard');
  useEffect(() => {
    console.log("User in dashboard:", user);
  }, [user]);
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        {
          t('welcome')
        }
      </h1>
    </main>
  );
}
