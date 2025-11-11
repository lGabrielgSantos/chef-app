import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

import pt from "@/messages/pt.json";
import en from "@/messages/en.json";

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children, params } = props;
  const { locale } = await params;

  const currentLocale = locale === "en" ? "en" : "pt";

  const messages = currentLocale === "en" ? en : pt;

  return (

    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
