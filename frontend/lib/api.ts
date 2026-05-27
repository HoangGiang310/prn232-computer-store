export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchProducts() {
  const res = await fetch(`${apiBaseUrl}/api/products`);
  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  return res.json();
}
