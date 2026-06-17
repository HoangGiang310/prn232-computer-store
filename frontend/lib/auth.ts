import { apiBaseUrl } from "./api";

export type AuthData = {
  token: string;
  username: string;
  role: string;
};

const storageKey = "computer-store-auth";

export function saveAuth(data: AuthData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}

export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(storageKey);
  if (!data) return null;

  try {
    return JSON.parse(data) as AuthData;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getAuth()?.token;
}

export function getRedirectFromRole(role: string) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/admin";
    case "sales":
    case "staff":
      return "/staff";
    case "customer":
      return "/customer";
    case "accountant":
    case "bookkeeper":
      return "/bookkeeper";
    case "warehouse":
    case "manager":
      return "/manager";
    default:
      return "/";
  }
}

export async function login(username: string, password: string) {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
  }

  const authData = {
    token: body.token,
    username: body.username,
    role: body.role,
  } as AuthData;

  saveAuth(authData);
  return authData;
}

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: string;
};

export async function register(data: RegisterData) {
  const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || "Đăng ký thất bại. Vui lòng thử lại.");
  }

  const authData = {
    token: body.token,
    username: body.username,
    role: body.role,
  } as AuthData;

  saveAuth(authData);
  return authData;
}

export function logout() {
  clearAuth();
}
