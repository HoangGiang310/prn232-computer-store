import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchCurrentCustomerOrders } from "../lib/api";
import { getAuth } from "../lib/auth";

type OrderItem = {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  orderChannel: string;
  orderStatus: string;
  paymentMethod: string;
  isPaid: boolean;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  createdAt: string;
  orderItems?: OrderItem[];
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  New: { bg: "#fff3e0", text: "#e65100", label: "Mới" },
  Processing: { bg: "#e3f2fd", text: "#0d47a1", label: "Đang xử lý" },
  Shipped: { bg: "#f3e5f5", text: "#4a148c", label: "Đã gửi" },
  Delivered: { bg: "#e8f5e9", text: "#1b5e20", label: "Đã giao" },
  Cancelled: { bg: "#ffebee", text: "#b71c1c", label: "Đã hủy" },
  Returned: { bg: "#fce4ec", text: "#880e4f", label: "Đã trả" },
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "customer") {
      router.replace("/login?redirect=customer");
      return;
    }

    loadOrders(auth.token);
  }, [router]);

  async function loadOrders(token: string) {
    try {
      setLoading(true);
      const data = await fetchCurrentCustomerOrders(token);
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải lịch sử đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusDisplay(status: string) {
    return statusColors[status] || { bg: "#f5f5f5", text: "#333", label: status };
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderStatus === filter;
  });

  const statusOptions = ["all", "New", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];
  const statusLabels: Record<string, string> = {
    all: "Tất cả đơn hàng",
    New: "Mới",
    Processing: "Đang xử lý",
    Shipped: "Đã gửi",
    Delivered: "Đã giao",
    Cancelled: "Đã hủy",
    Returned: "Đã trả",
  };

  if (loading) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Đang tải...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1>Lịch Sử Đơn Hàng</h1>
            <p>Xem và quản lý các đơn hàng của bạn</p>
          </div>
          <Link href="/">
            <button className="button">← Quay về trang chủ</button>
          </Link>
        </div>
      </section>

      {error && (
        <section className="card">
          <p className="error">{error}</p>
        </section>
      )}

      <section className="card">
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Lọc theo trạng thái:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
            <p style={{ fontSize: "18px", marginBottom: "16px" }}>
              {orders.length === 0 ? "Bạn chưa có đơn hàng nào" : "Không tìm thấy đơn hàng phù hợp"}
            </p>
            {orders.length === 0 && (
              <Link href="/products">
                <button className="button">Bắt đầu mua sắm</button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredOrders.map((order) => {
              const statusDisplay = getStatusDisplay(order.orderStatus);
              const isExpanded = expandedOrderId === order.id;
              const orderDate = new Date(order.createdAt);

              return (
                <div
                  key={order.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {/* Summary Row */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    style={{
                      padding: "16px",
                      backgroundColor: "#fafafa",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <span style={{ fontWeight: 700, fontSize: "16px" }}>Đơn hàng #{order.id.substring(0, 8)}</span>
                        <span
                          style={{
                            backgroundColor: statusDisplay.bg,
                            color: statusDisplay.text,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {statusDisplay.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        Ngày đặt: {orderDate.toLocaleDateString("vi-VN")} · Tổng cộng:{" "}
                        <strong>{order.finalAmount.toLocaleString("vi-VN")} ₫</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "20px", color: "#999" }}>{isExpanded ? "▼" : "▶"}</div>
                    </div>
                  </div>

                  {/* Details (Expanded) */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#fff",
                        borderTop: "1px solid #eee",
                        display: "grid",
                        gap: "12px",
                      }}
                    >
                      {/* Basic Info */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Mã đơn hàng:</span>
                          <span style={{ color: "#d32f2f", fontWeight: 600 }}>{order.id}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Ngày đặt:</span>
                          <span>{orderDate.toLocaleString("vi-VN")}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Kênh đặt hàng:</span>
                          <span>{order.orderChannel}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Phương thức thanh toán:</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Trạng thái thanh toán:</span>
                          <span style={{ color: order.isPaid ? "#2e7d32" : "#d32f2f" }}>
                            {order.isPaid ? "✓ Đã thanh toán" : "Chưa thanh toán"}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      {(order.shippingName || order.shippingPhone || order.shippingAddress) && (
                        <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                          <span style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Thông tin giao nhận:</span>
                          <div style={{ fontSize: "14px", color: "#666" }}>
                            {order.shippingName && <div>Người nhận: {order.shippingName}</div>}
                            {order.shippingPhone && <div>Số điện thoại: {order.shippingPhone}</div>}
                            {order.shippingAddress && <div>Địa chỉ: {order.shippingAddress}</div>}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      {order.orderItems && order.orderItems.length > 0 && (
                        <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                          <span style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Sản phẩm ({order.orderItems.length} mặt hàng):</span>
                          <div style={{ display: "grid", gap: "8px" }}>
                            {order.orderItems.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "8px",
                                  backgroundColor: "#f9f9f9",
                                  borderRadius: "4px",
                                  fontSize: "14px",
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600 }}>{item.productName || `Sản phẩm ${item.productId}`}</div>
                                  <div style={{ color: "#999" }}>Số lượng: {item.quantity}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div>{item.unitPrice.toLocaleString("vi-VN")} ₫</div>
                                  <div style={{ fontWeight: 700, color: "#d32f2f" }}>
                                    {(item.quantity * item.unitPrice).toLocaleString("vi-VN")} ₫
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span>Tổng tiền hàng:</span>
                          <span>{order.totalAmount.toLocaleString("vi-VN")} ₫</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#2e7d32" }}>
                            <span>Giảm giá:</span>
                            <span>-{order.discountAmount.toLocaleString("vi-VN")} ₫</span>
                          </div>
                        )}
                        {order.shippingFee > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span>Phí vận chuyển:</span>
                            <span>{order.shippingFee.toLocaleString("vi-VN")} ₫</span>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: 700,
                            color: "#d32f2f",
                            paddingTop: "8px",
                            borderTop: "1px solid #eee",
                            marginTop: "8px",
                          }}
                        >
                          <span>Tổng cộng:</span>
                          <span>{order.finalAmount.toLocaleString("vi-VN")} ₫</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
