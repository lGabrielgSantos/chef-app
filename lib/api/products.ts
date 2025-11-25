import { api } from "./index";
import {
  productFromDto,
  type Product,
  type ProductDTO,
  type ProductPayload,
} from "@/lib/dto/product";

function unwrapData<T>(responseData: any): T {
  return (responseData?.data ?? responseData) as T;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await api.get("/products");
  const payload = unwrapData<ProductDTO[] | { products: ProductDTO[] }>(
    response.data
  );
  const products = Array.isArray(payload)
    ? payload
    : payload?.products ?? [];

  return products.map(productFromDto);
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  const payload = unwrapData<ProductDTO | { product: ProductDTO }>(
    response.data
  );
  const product = Array.isArray(payload)
    ? payload[0]
    : (payload as { product?: ProductDTO }).product ?? payload;

  return productFromDto(product);
}

export async function createProduct(data: ProductPayload): Promise<Product> {
  const response = await api.post("/products", data);
  const payload = unwrapData<ProductDTO | { product: ProductDTO }>(
    response.data
  );

  return productFromDto(
    (payload as { product?: ProductDTO }).product ?? payload
  );
}

export async function updateProduct(
  id: string,
  data: Partial<ProductPayload>
): Promise<Product> {
  const response = await api.put(`/products/${id}`, data);
  const payload = unwrapData<ProductDTO | { product: ProductDTO }>(
    response.data
  );

  return productFromDto(
    (payload as { product?: ProductDTO }).product ?? payload
  );
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export type { Product, ProductDTO, ProductPayload } from "@/lib/dto/product";
