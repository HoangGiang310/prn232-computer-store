import { request, authRequest } from "./axiosClient";

export async function login(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getMe(token) {
  return authRequest("/api/auth/me", token);
}
