import { useCallback, useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProducts,
  updateProduct,
} from "@/lib/api/products";
import type { Product, ProductPayload } from "@/lib/dto/product";

interface UseProductsOptions {
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
  loadProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product>;
  addProduct: (data: ProductPayload) => Promise<Product>;
  editProduct: (
    id: string,
    data: Partial<ProductPayload>
  ) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
}

export function useProducts(
  options: UseProductsOptions = { autoFetch: true }
): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { autoFetch = true } = options;

  const handleError = useCallback((err: unknown) => {
    const normalizedError =
      err instanceof Error ? err : new Error("Unable to load products.");
    setError(normalizedError);
    return normalizedError;
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getProductById = useCallback(
    async (id: string) => {
      try {
        return await fetchProduct(id);
      } catch (err) {
        throw handleError(err);
      }
    },
    [handleError]
  );

  const addProduct = useCallback(
    async (data: ProductPayload) => {
      try {
        const created = await createProduct(data);
        setProducts((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        throw handleError(err);
      }
    },
    [handleError]
  );

  const editProduct = useCallback(
    async (id: string, data: Partial<ProductPayload>) => {
      try {
        const updated = await updateProduct(id, data);
        setProducts((prev) =>
          prev.map((product) =>
            product.id === id ? { ...product, ...updated } : product
          )
        );
        return updated;
      } catch (err) {
        throw handleError(err);
      }
    },
    [handleError]
  );

  const removeProduct = useCallback(
    async (id: string) => {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } catch (err) {
        throw handleError(err);
      }
    },
    [handleError]
  );

  useEffect(() => {
    if (autoFetch) {
      loadProducts();
    }
  }, [autoFetch, loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    getProductById,
    addProduct,
    editProduct,
    removeProduct,
  };
}
