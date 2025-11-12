"use client";

import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

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
