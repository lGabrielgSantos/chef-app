"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Customer = {
  name: string
  email: string
  city: string
  status: "active" | "trial"
}

const customersByLocale: Record<string, Customer[]> = {
  en: [
    {
      name: "Sofia Cooper",
      email: "sofia.cooper@example.com",
      city: "San Francisco, CA",
      status: "active",
    },
    {
      name: "Anthony Nguyen",
      email: "anthony.nguyen@example.com",
      city: "Austin, TX",
      status: "trial",
    },
    {
      name: "Maria Lopez",
      email: "maria.lopez@example.com",
      city: "Miami, FL",
      status: "active",
    },
  ],
  pt: [
    {
      name: "Ana Souza",
      email: "ana.souza@example.com",
      city: "Sao Paulo, SP",
      status: "active",
    },
    {
      name: "Bruno Lima",
      email: "bruno.lima@example.com",
      city: "Rio de Janeiro, RJ",
      status: "trial",
    },
    {
      name: "Carla Ramos",
      email: "carla.ramos@example.com",
      city: "Belo Horizonte, MG",
      status: "active",
    },
  ],
}

export default function CustomersPage() {
  const params = useParams<{ locale: string }>()
  const localeParam = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const locale = localeParam === "en" ? "en" : "pt"
  const t = useTranslations("customersPage")

  const customers = customersByLocale[locale] ?? customersByLocale.en

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <Button>{t("addCustomer")}</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t("searchPlaceholder")}
            className="max-w-md"
            aria-label={t("searchPlaceholder")}
          />
          <div className="space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.email}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {customer.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="font-medium leading-none">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{customer.city}</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {t(`status.${customer.status}`)}
                  </span>
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
