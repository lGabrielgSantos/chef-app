import { Avatar, AvatarFallback } from "./ui/avatar";
import NewProductModal from "./NewProductModal";
import type { Product, ProductPayload } from "@/lib/dto/product";

interface NewProductCardProps {
  product: Product;
  t?: (key: string, options?: { defaultMessage?: string }) => string;
  onEdit?: (id: string, data: Partial<ProductPayload>) => Promise<unknown>;
  editLabel?: string;
}

export default function NewProductCard({
  product,
  t = (key: string, options?: { defaultMessage?: string }) =>
    options?.defaultMessage ?? key,
  onEdit,
  editLabel,
}: NewProductCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price ?? 0);

  const productInitials =
    product.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "$";

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{productInitials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-medium leading-none">{product.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(product.price)}
          </p>
          {product.description && (
            <p className="text-sm text-muted-foreground break-words">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {onEdit && (
        <NewProductModal
          product={product}
          onSubmit={(payload) => onEdit(product.id, payload)}
          triggerLabel={editLabel ?? "Edit"}
          triggerButtonProps={{
            variant: "outline",
            size: "sm",
            className: "w-auto h-8 px-3 self-start sm:self-auto",
          }}
        />
      )}
    </div>
  );
}
