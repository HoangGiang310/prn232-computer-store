import { authRequest } from "./axiosClient";

export async function fetchOrders(token) {
  return authRequest("/api/orders", token);
}

export async function checkoutOrder(payload, token) {
  return authRequest("/api/orders/checkout", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
