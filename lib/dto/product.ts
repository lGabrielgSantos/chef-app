export interface ProductDTO {
  id?: string | number;
  _id?: string;
  name?: string | null;
  price?: string | number | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
}

export interface ProductPayload {
  name: string;
  price: number;
  description?: string | null;
}

export interface Product extends ProductPayload {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function productFromDto(payload: ProductDTO): Product {
  if (!payload) {
    throw new Error("Invalid product payload");
  }

  const rawPrice = payload.price ?? 0;
  const normalizedPrice =
    typeof rawPrice === "string"
      ? parseFloat(rawPrice)
      : typeof rawPrice === "number"
        ? rawPrice
        : Number(rawPrice ?? 0);

  return {
    id: String(payload.id ?? payload._id ?? ""),
    name: payload.name ?? "",
    price: Number.isFinite(normalizedPrice) ? normalizedPrice : 0,
    description: payload.description ?? "",
    createdAt: payload.createdAt ?? payload.created_at ?? null,
    updatedAt: payload.updatedAt ?? payload.updated_at ?? null,
  };
}
