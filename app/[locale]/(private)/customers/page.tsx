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
import NewCustomerModal from "@/components/NewCustomerModal";
import { useCustomers } from "@/lib/hooks/useCustomers";

import type { CustomerStatus } from "@/lib/api/customers";

export default function CustomersPage() {
  const t = useTranslations("customersPage");
  const { customers, loading, error, addCustomer } = useCustomers();
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

  const getStatusStyles = (status?: CustomerStatus | null) => {
    const statusKey = status ?? "active";
    switch (statusKey) {
      case "active":
        return "bg-green-500 text-white";
      case "trial":
        return "bg-yellow-500 text-white";
      case "inactive":
        return "bg-gray-500 text-white";
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
          <NewCustomerModal onCreate={addCustomer} triggerLabel="Novo Customer" />
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
                  <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${getStatusStyles(customer.status)}`}>
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
