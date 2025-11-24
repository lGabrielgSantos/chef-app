"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner";
import NewCustomerModal from "@/components/NewCustomerModal";
import { useCustomers } from "@/lib/hooks/useCustomers";
import NewCustomerCard from "@/components/NewCustomerCard";


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


  return (
    <div className="flex flex-col gap-6">
      <Card  className="h-[85vh] flex flex-col">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <NewCustomerModal
            onCreate={addCustomer}
            triggerLabel={t("addCustomer")}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 flex-1 min-h-0">
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

          <ScrollArea className="h-[60vh] pr-1">

            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <NewCustomerCard key={customer.id ?? customer.email} customer={customer} t={t} />
           
              ))}

              {!loading && filteredCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("empty")}</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
