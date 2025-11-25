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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import NewProductCard from "@/components/NewProductCard";
import NewProductModal from "@/components/NewProductModal";
import { useProducts } from "@/lib/hooks/useProducts";

export default function ProductsPage() {
  const t = useTranslations("productsPage");
  const formT = useTranslations("productsForm");
  const { products, loading, error, addProduct, editProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [product.name, product.description]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    );
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="h-[85vh] flex flex-col">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <NewProductModal
            onSubmit={addProduct}
            triggerLabel={t("addProduct")}
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

          <ScrollArea className="h-[90%] pr-1">
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <NewProductCard
                  key={product.id}
                  product={product}
                  t={t}
                  onEdit={editProduct}
                  editLabel={formT("actions.edit")}
                />
              ))}

              {!loading && filteredProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("empty")}</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
