export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ProductPayload = {
  id?: string;
  productCode: string;
  name: string;
  brand: string;
  specifications: string;
  importPrice: number;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
};

export async function fetchProducts() {
  const res = await fetch(`${apiBaseUrl}/api/products`);
  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  return res.json();
}

export async function fetchProductById(id: string) {
  const res = await fetch(`${apiBaseUrl}/api/products/${id}`);
  if (!res.ok) throw new Error("Không thể tải chi tiết sản phẩm");
  return res.json();
}

const authHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export async function createProduct(product: ProductPayload, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/products`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || "Không thể tạo sản phẩm.");
  }

  return body;
}

export async function updateProduct(
  id: string,
  product: ProductPayload,
  token?: string,
) {
  const res = await fetch(`${apiBaseUrl}/api/products/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Không thể cập nhật sản phẩm.");
  }
}

export async function deleteProduct(id: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Không thể xóa sản phẩm.");
  }
}

export type OrderItemPayload = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type OrderPayload = {
  orderChannel: string;
  orderStatus: string;
  paymentMethod: string;
  isPaid: boolean;
  customerId?: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  voucherCode?: string | null;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  createdById?: string | null;
  orderItems: OrderItemPayload[];
};

export async function fetchOrders() {
  const res = await fetch(`${apiBaseUrl}/api/orders`);
  if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
  return res.json();
}

export async function createOrder(order: OrderPayload, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/orders`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(order),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || "Không thể tạo đơn hàng.");
  }

  return body;
}

export async function updateOrderStatus(
  id: string,
  order: Partial<OrderPayload>,
  token?: string,
) {
  const res = await fetch(`${apiBaseUrl}/api/orders/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(order),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Không thể cập nhật đơn hàng.");
  }
}

export type InventoryAdjustmentPayload = {
  productId: string;
  quantityChanged: number;
  changeType: string;
  note: string;
  changedById?: string | null;
};

export async function fetchInventoryProducts() {
  const res = await fetch(`${apiBaseUrl}/api/inventory/products`);
  if (!res.ok) throw new Error("Không thể tải danh sách tồn kho");
  return res.json();
}

export async function fetchInventoryHistory() {
  const res = await fetch(`${apiBaseUrl}/api/inventory/history`);
  if (!res.ok) throw new Error("Không thể tải lịch sử kho");
  return res.json();
}

export async function adjustInventory(
  payload: InventoryAdjustmentPayload,
  token?: string,
) {
  const res = await fetch(`${apiBaseUrl}/api/inventory/adjust`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || "Không thể điều chỉnh tồn kho.");
  }

  return body;
}
