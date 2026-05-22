export const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function request(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.message || response.statusText || "Lỗi khi gọi API",
    );
  }

  return payload;
}

export function authRequest(path, token, options = {}) {
  return request(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export default request;
