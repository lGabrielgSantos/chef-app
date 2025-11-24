"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCustomers } from "@/lib/hooks/useCustomers";

import type { CustomerStatus } from "@/lib/api/customers";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const t = useTranslations("customersPage");
  const { customers, loading, error } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.email, customer.city]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    );
  }, [customers, searchTerm]);

  const formatStatus = (status?: CustomerStatus | null) => {
    const statusKey = status ?? "active";
    return t(`status.${statusKey}`, { defaultMessage: statusKey });
  };

  const getStatusColor = (status?: CustomerStatus | null) => {
    const statusKey = status ?? "active";
    switch (statusKey) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "trial":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "inactive":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <Button className="w-full sm:w-auto">{t("addCustomer")}</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t("searchPlaceholder")}
            className="max-w-md"
            aria-label={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {loading && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {t("error")}
            </p>
          )}

          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id ?? customer.email}
                className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 sm:items-center">
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
                    <p className="text-sm break-words text-muted-foreground">
                      {customer.email}
                    </p>
                    {customer.phone && (
                      <p className="text-sm break-words text-muted-foreground">
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                  <span>{customer.city}</span>
                  <span className={cn("self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto", getStatusColor(customer.status))}>
                    {formatStatus(customer.status)}
                  </span>
                </div>
              </div>
            ))}

            {!loading && filteredCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
