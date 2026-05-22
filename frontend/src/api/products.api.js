import { request, authRequest } from "./axiosClient";

export async function fetchProducts(query = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return request(`/api/products${queryString ? `?${queryString}` : ""}`);
}

export async function createProduct(payload, token) {
  return authRequest("/api/products", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id, payload, token) {
  return authRequest(`/api/products/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id, token) {
  return authRequest(`/api/products/${id}`, token, {
    method: "DELETE",
  });
}
