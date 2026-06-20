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

// Trích xuất thông báo lỗi từ response, hỗ trợ cả lỗi validation của ASP.NET Core
// ({ errors: { Field: ["msg"] } }) lẫn lỗi nghiệp vụ ({ message: "..." }).
export function extractApiError(body: any, fallback: string): string {
  if (!body) return fallback;
  if (typeof body === "string") return body || fallback;
  if (body.message) return body.message;
  if (body.errors && typeof body.errors === "object") {
    const messages = Object.values(body.errors)
      .flat()
      .filter(Boolean) as string[];
    if (messages.length > 0) return messages.join(" ");
  }
  if (body.title) return body.title;
  return fallback;
}

export async function createProduct(product: ProductPayload, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/products`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(extractApiError(body, "Không thể tạo sản phẩm."));
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
    throw new Error(extractApiError(body, "Không thể cập nhật sản phẩm."));
  }
}

export async function deleteProduct(id: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể xóa sản phẩm."));
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
    throw new Error(extractApiError(body, "Không thể tạo đơn hàng."));
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
    throw new Error(extractApiError(body, "Không thể cập nhật đơn hàng."));
  }
}

export type InventoryAdjustmentPayload = {
  productId: string;
  quantityChanged: number;
  changeType: string;
  note: string;
  changedById?: string | null;
};

export async function fetchInventoryProducts(token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/inventory/products`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải danh sách tồn kho");
  return res.json();
}

export async function fetchInventoryHistory(token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/inventory/history`, {
    headers: authHeaders(token),
  });
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
    throw new Error(extractApiError(body, "Không thể điều chỉnh tồn kho."));
  }

  return body;
}

// ==========================================
// CUSTOMERS API WRAPPERS
// ==========================================
export async function fetchCustomers(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${apiBaseUrl}/api/customers${query}`);
  if (!res.ok) throw new Error("Không thể tải danh sách khách hàng");
  return res.json();
}

export async function fetchCustomerById(id: string) {
  const res = await fetch(`${apiBaseUrl}/api/customers/${id}`);
  if (!res.ok) throw new Error("Không thể tải thông tin khách hàng");
  return res.json();
}

export async function fetchCurrentCustomer(token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/customers/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải thông tin khách hàng hiện tại");
  return res.json();
}

export async function fetchCustomerOrders(id: string) {
  const res = await fetch(`${apiBaseUrl}/api/customers/${id}/orders`);
  if (!res.ok) throw new Error("Không thể tải lịch sử mua hàng");
  return res.json();
}

export async function fetchCurrentCustomerOrders(token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/customers/me/orders`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải lịch sử đơn hàng của bạn");
  return res.json();
}

export async function createCustomer(customer: any, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/customers`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(customer),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể tạo khách hàng."));
  return body;
}

export async function updateCustomer(id: string, customer: any, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/customers/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(customer),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể cập nhật khách hàng."));
  }
}

export async function deleteCustomer(id: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/customers/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể xóa khách hàng."));
  }
}

// ==========================================
// VOUCHERS API WRAPPERS
// ==========================================
export async function fetchVouchers() {
  const res = await fetch(`${apiBaseUrl}/api/vouchers`);
  if (!res.ok) throw new Error("Không thể tải danh sách voucher");
  return res.json();
}

export async function fetchVoucherByCode(code: string) {
  const res = await fetch(`${apiBaseUrl}/api/vouchers/${code}`);
  if (!res.ok) throw new Error("Không thể kiểm tra voucher");
  return res.json();
}

export async function createVoucher(voucher: any, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/vouchers`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(voucher),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể tạo voucher."));
  return body;
}

export async function updateVoucher(code: string, voucher: any, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/vouchers/${code}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(voucher),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể cập nhật voucher."));
  }
}

export async function deleteVoucher(code: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/vouchers/${code}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể xóa voucher."));
  }
}

// ==========================================
// USERS / EMPLOYEES API WRAPPERS
// ==========================================
export async function fetchUsers() {
  const res = await fetch(`${apiBaseUrl}/api/users`);
  if (!res.ok) throw new Error("Không thể tải danh sách nhân viên");
  return res.json();
}

export async function fetchUserById(id: string) {
  const res = await fetch(`${apiBaseUrl}/api/users/${id}`);
  if (!res.ok) throw new Error("Không thể tải thông tin nhân viên");
  return res.json();
}

export async function createUser(user: any, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/users`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(user),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể tạo nhân viên."));
  return body;
}

export async function updateUser(id: string, user: any, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/users/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể cập nhật nhân viên."));
  }
}

export async function resetUserPassword(id: string, newPassword?: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/users/${id}/reset-password`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ newPassword }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể đặt lại mật khẩu."));
  return body;
}

export async function deleteUser(id: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể vô hiệu hóa nhân viên."));
  }
}

// ==========================================
// REPORTS API WRAPPERS
// ==========================================
export async function fetchSalesReport(startDate?: string, endDate?: string, token?: string) {
  const query = `?startDate=${startDate || ""}&endDate=${endDate || ""}`;
  const res = await fetch(`${apiBaseUrl}/api/reports/sales${query}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải báo cáo doanh thu");
  return res.json();
}

export async function fetchTopSellingProducts(limit?: number, token?: string) {
  const query = limit ? `?limit=${limit}` : "";
  const res = await fetch(`${apiBaseUrl}/api/reports/top-selling${query}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải sản phẩm bán chạy");
  return res.json();
}

export async function fetchInventoryStatusReport(token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/reports/inventory-status`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải trạng thái kho");
  return res.json();
}

// ==========================================
// RETURNS API WRAPPERS
// ==========================================
export async function fetchReturns() {
  const res = await fetch(`${apiBaseUrl}/api/returns`);
  if (!res.ok) throw new Error("Không thể tải danh sách phiếu trả hàng");
  return res.json();
}

export async function createReturn(orderId: string, reason: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/returns`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ orderId, reason }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể tạo phiếu trả hàng."));
  return body;
}

export async function processReturn(id: string, status: string, processedById?: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/returns/${id}/process`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status, processedById }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể duyệt trả hàng."));
  return body;
}

// ==========================================
// PRODUCT REVIEWS API WRAPPERS (UC-15)
// ==========================================
export type ReviewPayload = {
  productId: string;
  rating: number;
  title?: string;
  content?: string;
};

export async function fetchProductReviews(
  productId: string,
  sort: string = "helpful",
  star?: number,
) {
  const params = new URLSearchParams({ sort });
  if (star) params.set("star", String(star));
  const res = await fetch(
    `${apiBaseUrl}/api/reviews/product/${productId}?${params.toString()}`,
  );
  if (!res.ok) throw new Error("Không thể tải đánh giá sản phẩm");
  return res.json();
}

export async function fetchReviewSummary(productId: string) {
  const res = await fetch(`${apiBaseUrl}/api/reviews/product/${productId}/summary`);
  if (!res.ok) throw new Error("Không thể tải tóm tắt đánh giá");
  return res.json();
}

export async function fetchReviewEligibility(productId: string, token?: string) {
  const res = await fetch(
    `${apiBaseUrl}/api/reviews/product/${productId}/eligibility`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) throw new Error("Không thể kiểm tra quyền đánh giá");
  return res.json();
}

export async function createReview(review: ReviewPayload, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/reviews`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(review),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể gửi đánh giá."));
  return body;
}

export async function updateReview(
  id: string,
  review: Omit<ReviewPayload, "productId">,
  token?: string,
) {
  const res = await fetch(`${apiBaseUrl}/api/reviews/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(review),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể cập nhật đánh giá."));
  return body;
}

export async function deleteReview(id: string, token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/reviews/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractApiError(body, "Không thể xóa đánh giá."));
  }
}

export async function markReviewHelpful(id: string) {
  const res = await fetch(`${apiBaseUrl}/api/reviews/${id}/helpful`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể đánh dấu hữu ích."));
  return body;
}

export async function fetchAllReviewsForAdmin(token?: string) {
  const res = await fetch(`${apiBaseUrl}/api/reviews/admin/all`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Không thể tải danh sách đánh giá");
  return res.json();
}

export async function setReviewVisibility(
  id: string,
  isHidden: boolean,
  token?: string,
) {
  const res = await fetch(`${apiBaseUrl}/api/reviews/${id}/visibility`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ isHidden }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(body, "Không thể cập nhật trạng thái đánh giá."));
  return body;
}
