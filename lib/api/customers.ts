import { api } from "./index";

export type CustomerStatus = "active" | "trial" | "inactive";

export interface CustomerPayload {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  status?: CustomerStatus;
}

export interface Customer extends CustomerPayload {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeCustomer(payload: any): Customer {
  if (!payload) {
    throw new Error("Invalid customer payload");
  }

  return {
    id: String(payload.id ?? payload._id ?? ""),
    name: payload.name ?? "",
    email: payload.email ?? "",
    phone: payload.phone ?? null,
    city: payload.city ?? null,
    status: payload.status as CustomerStatus | undefined,
    createdAt: payload.createdAt ?? payload.created_at,
    updatedAt: payload.updatedAt ?? payload.updated_at,
  };
}

function unwrapData<T>(responseData: any): T {
  return (responseData?.data ?? responseData) as T;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await api.get("/customers");
  const payload = unwrapData<any>(response.data);
  const customers = Array.isArray(payload)
    ? payload
    : payload?.customers ?? [];

  return customers.map(normalizeCustomer);
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const response = await api.get(`/customers/${id}`);
  const payload = unwrapData<any>(response.data);
  const customer = Array.isArray(payload) ? payload[0] : payload?.customer ?? payload;

  return normalizeCustomer(customer);
}

export async function createCustomer(data: CustomerPayload): Promise<Customer> {
  const response = await api.post("/customers", data);
  const payload = unwrapData<any>(response.data);

  return normalizeCustomer(payload?.customer ?? payload);
}

export async function updateCustomer(
  id: string,
  data: Partial<CustomerPayload>
): Promise<Customer> {
  const response = await api.put(`/customers/${id}`, data);
  const payload = unwrapData<any>(response.data);

  return normalizeCustomer(payload?.customer ?? payload);
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
