import { authRequest } from "./axiosClient";

export async function fetchCustomers(token) {
  return authRequest("/api/customers", token);
}

export async function createCustomer(payload, token) {
  return authRequest("/api/customers", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCustomer(id, payload, token) {
  return authRequest(`/api/customers/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCustomer(id, token) {
  return authRequest(`/api/customers/${id}`, token, {
    method: "DELETE",
  });
}
