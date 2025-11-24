import { api } from "./index";
import {
  customerFromDto,
  type Customer,
  type CustomerDTO,
  type CustomerPayload,
} from "@/lib/dto/customer";

function unwrapData<T>(responseData: any): T {
  return (responseData?.data ?? responseData) as T;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await api.get("/customers");
  const payload = unwrapData<CustomerDTO[] | { customers: CustomerDTO[] }>(
    response.data
  );
  const customers = Array.isArray(payload)
    ? payload
    : payload?.customers ?? [];

  return customers.map(customerFromDto);
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const response = await api.get(`/customers/${id}`);
  const payload = unwrapData<
    CustomerDTO | CustomerDTO[] | { customer: CustomerDTO }
  >(response.data);
  const customer = Array.isArray(payload)
    ? payload[0]
    : payload?.customer ?? payload;

  return customerFromDto(customer);
}

export async function createCustomer(data: CustomerPayload): Promise<Customer> {
  const response = await api.post("/customers", data);
  const payload = unwrapData<CustomerDTO | { customer: CustomerDTO }>(
    response.data
  );

  return customerFromDto(payload?.customer ?? payload);
}

export async function updateCustomer(
  id: string,
  data: Partial<CustomerPayload>
): Promise<Customer> {
  const response = await api.put(`/customers/${id}`, data);
  const payload = unwrapData<CustomerDTO | { customer: CustomerDTO }>(
    response.data
  );

  return customerFromDto(payload?.customer ?? payload);
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}

export type {
  Customer,
  CustomerDTO,
  CustomerPayload,
  CustomerStatus,
} from "@/lib/dto/customer";
