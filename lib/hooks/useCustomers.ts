import { useCallback, useEffect, useState } from "react";

import {
  createCustomer,
  deleteCustomer,
  fetchCustomer,
  fetchCustomers,
  updateCustomer,
  Customer,
  CustomerPayload,
} from "@/lib/api/customers";

interface UseCustomersOptions {
  autoFetch?: boolean;
}

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  loadCustomers: () => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer>;
  addCustomer: (data: CustomerPayload) => Promise<Customer>;
  editCustomer: (
    id: string,
    data: Partial<CustomerPayload>
  ) => Promise<Customer>;
  removeCustomer: (id: string) => Promise<void>;
}

export function useCustomers(
  options: UseCustomersOptions = { autoFetch: true }
): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { autoFetch = true } = options;

  const handleError = useCallback((err: unknown) => {
    const normalizedError =
      err instanceof Error ? err : new Error("Unable to load customers.");
    setError(normalizedError);
    return normalizedError;
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      console.log("Fetched customers:", data);
      setCustomers(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getCustomerById = useCallback(async (id: string) => {
    try {
      return await fetchCustomer(id);
    } catch (err) {
      throw handleError(err);
    }
  }, [handleError]);

  const addCustomer = useCallback(
    async (data: CustomerPayload) => {
      try {
        const created = await createCustomer(data);
        setCustomers((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        throw handleError(err);
      }
    },
    [handleError]
  );

  const editCustomer = useCallback(
    async (id: string, data: Partial<CustomerPayload>) => {
      try {
        const updated = await updateCustomer(id, data);
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === id ? { ...customer, ...updated } : customer
          )
        );
        return updated;
      } catch (err) {
        throw handleError(err);
      }
    },
    [handleError]
  );

  const removeCustomer = useCallback(
    async (id: string) => {
      try {
        await deleteCustomer(id);
        setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      } catch (err) {
        throw handleError(err);
      }
    },
    [handleError]
  );

  useEffect(() => {
    if (autoFetch) {
      loadCustomers();
    }
  }, [autoFetch, loadCustomers]);

  return {
    customers,
    loading,
    error,
    loadCustomers,
    getCustomerById,
    addCustomer,
    editCustomer,
    removeCustomer,
  };
}
