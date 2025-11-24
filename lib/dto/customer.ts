export type CustomerStatus = "active" | "trial" | "inactive";

export interface CustomerDTO {
  id?: string;
  _id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  status?: CustomerStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CustomerPayload {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  status?: CustomerStatus;
}

export interface Customer extends CustomerPayload {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function customerFromDto(payload: CustomerDTO): Customer {
  if (!payload) {
    throw new Error("Invalid customer payload");
  }

  return {
    id: String(payload.id ?? payload._id ?? ""),
    name: payload.name ?? "",
    email: payload.email ?? "",
    phone: payload.phone ?? null,
    city: payload.city ?? null,
    status: payload.status ?? undefined,
    createdAt: payload.createdAt ?? payload.created_at ?? null,
    updatedAt: payload.updatedAt ?? payload.updated_at ?? null,
  };
}
