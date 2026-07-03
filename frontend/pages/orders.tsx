import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { fetchOrders, updateOrderStatus, fetchReturns, createReturn, processReturn } from "../lib/api";
import { getAuth } from "../lib/auth";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: {
    name: string;
    productCode: string;
    category?: string;
  };
};

type Order = {
  id: string;
  orderChannel: string;
  orderStatus: string;
  paymentMethod: string;
  isPaid: boolean;
  customer?: { fullName?: string; phone?: string } | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
};

const statusOptions = [
  "New",
  "Confirmed",
  "Shipping",
  "Delivered",
  "Cancelled",
  "Returned",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
    {},
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    loadReturns();
    setCurrentUser(getAuth());
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchOrders();
      setOrders(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReturns() {
    try {
      const result = await fetchReturns();
      setReturns(result);
    } catch (err) {
      console.error("Không thể tải danh sách trả hàng", err);
    }
  }

  async function handleSaveStatus(order: Order) {
    const nextStatus = statusUpdates[order.id] || order.orderStatus;
    if (!nextStatus || nextStatus === order.orderStatus) return;
    setSavingId(order.id);
    setError("");

    try {
      const token = currentUser?.token;
      await updateOrderStatus(order.id, { orderStatus: nextStatus }, token);
      await loadOrders();
      setExpandedOrderId(order.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái đơn.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleRequestReturn(orderId: string) {
    const reason = prompt("Nhập lý do trả hàng / hoàn tiền:");
    if (!reason || !reason.trim()) return;

    try {
      const token = currentUser?.token;
      await createReturn(orderId, reason.trim(), token);
      alert("Đã tạo yêu cầu hoàn trả thành công. Vui lòng chờ bộ phận quản lý duyệt.");
      await loadOrders();
      await loadReturns();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi tạo yêu cầu hoàn trả.");
    }
  }

  async function handleProcessReturn(returnId: string, status: string) {
    const confirmMsg = status === "Refunded"
      ? "Đồng ý hoàn tiền đơn hàng này và tự động CỘNG lại số lượng tồn kho sản phẩm?"
      : "Từ chối yêu cầu hoàn trả này?";

    if (!confirm(confirmMsg)) return;

    try {
      const token = currentUser?.token;
      await processReturn(returnId, status, currentUser?.id, token);
      alert("Xử lý phiếu trả hàng thành công.");
      await loadOrders();
      await loadReturns();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi xử lý hoàn trả.");
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus && order.orderStatus !== selectedStatus) return false;
      if (selectedChannel && order.orderChannel !== selectedChannel)
        return false;
      return true;
    });
  }, [orders, selectedStatus, selectedChannel]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus !== "Delivered" &&
      order.orderStatus !== "Cancelled" &&
      order.orderStatus !== "Returned"
  ).length;
  const totalRevenue = orders.reduce((acc, order) => acc + order.finalAmount, 0);

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản Lý Đơn Hàng</h1>
        <p>
          Xem danh sách đơn, theo dõi trạng thái và cập nhật đơn hàng cho kênh
          online/offline.
        </p>
      </section>

      <section className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "16px",
              background: "#f8fafc",
              borderRadius: "12px",
            }}
          >
            <h3>Tổng đơn hàng</h3>
            <p style={{ fontSize: "32px", margin: "12px 0 0" }}>{totalOrders}</p>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "16px",
              background: "#f8fafc",
              borderRadius: "12px",
            }}
          >
            <h3>Đơn hàng đang xử lý</h3>
            <p style={{ fontSize: "32px", margin: "12px 0 0", color: "#d97706" }}>
              {pendingOrders}
            </p>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "16px",
              background: "#f8fafc",
              borderRadius: "12px",
            }}
          >
            <h3>Doanh thu</h3>
            <p style={{ fontSize: "32px", margin: "12px 0 0" }}>
              {totalRevenue.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="buttons-group" style={{ justifyContent: "flex-start" }}>
          <Link href="/admin" className="button">
            Quay lại Admin
          </Link>
        </div>

        <div className="input-group" style={{ marginTop: "16px" }}>
          <label>
            Lọc trạng thái
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tất cả</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lọc kênh bán
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card">
        <h2 className="product-list-title">Danh Sách Đơn Hàng</h2>
        {error ? <p className="error">{error}</p> : null}
        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : filteredOrders.length === 0 ? (
          <p>Không có đơn hàng để hiển thị.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="order-list-table">
              <thead>
                <tr>
                  <th>Đơn hàng</th>
                  <th>Kênh</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Tổng</th>
                  <th>Khách</th>
                  <th>Ngày</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td>{order.id.slice(0, 8)}</td>
                      <td>{order.orderChannel}</td>
                      <td>{order.orderStatus}</td>
                      <td>
                        {order.paymentMethod} /{" "}
                        {order.isPaid ? "Đã thanh toán" : "Chưa"}
                      </td>
                      <td>
                        {order.finalAmount.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                      <td>{order.customer?.fullName ?? order.shippingName}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td>
                        <button
                          className="button"
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id,
                            )
                          }
                        >
                          {expandedOrderId === order.id
                            ? "Thu gọn"
                            : "Chi tiết"}
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.id ? (
                      <tr key={`${order.id}-details`}>
                        <td
                          colSpan={8}
                          style={{ padding: "16px", background: "#f3f4f6" }}
                        >
                          <div className="order-detail-grid">
                            <div className="order-detail-card">
                              <strong>Địa chỉ giao nhận:</strong>
                              <div style={{ marginTop: "8px", color: "#374151" }}>
                                {order.shippingName} | {order.shippingPhone} | {order.shippingAddress}
                              </div>
                            </div>
                            <div className="order-detail-card">
                              <strong>Chi tiết sản phẩm:</strong>
                              <ul style={{ marginTop: "8px" }}>
                                {order.orderItems?.map((item) => (
                                  <li key={item.id}>
                                    {item.product?.name ?? item.productId}
                                    {item.product?.category ? ` (${item.product.category})` : ""} x {item.quantity} @ {item.unitPrice.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="order-detail-card">
                              <div
                                style={{
                                  display: "flex",
                                  gap: "12px",
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                }}
                              >
                                <label>
                                  Trạng thái mới
                                  <select
                                    value={
                                      statusUpdates[order.id] ?? order.orderStatus
                                    }
                                    onChange={(e) =>
                                      setStatusUpdates((prev) => ({
                                        ...prev,
                                        [order.id]: e.target.value,
                                      }))
                                    }
                                  >
                                    {statusOptions.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <button
                                  className="button"
                                  disabled={savingId === order.id}
                                  onClick={() => handleSaveStatus(order)}
                                >
                                  {savingId === order.id
                                    ? "Đang lưu..."
                                    : "Cập nhật trạng thái"}
                                </button>
                              </div>
                            </div>

                            {/* Section: Đổi trả / Hoàn tiền */}
                            {(() => {
                              const activeReturn = returns.find(r => r.orderId === order.id);
                              if (activeReturn) {
                                return (
                                  <div className="order-detail-card order-detail-return-card">
                                    <h4 style={{ margin: "0 0 8px 0", color: "#B45309" }}>Yêu cầu trả hàng & hoàn tiền:</h4>
                                    <p style={{ margin: "0 0 4px 0" }}><strong>Lý do:</strong> {activeReturn.reason}</p>
                                    <p style={{ margin: "0 0 4px 0" }}><strong>Tiền hoàn lại:</strong> {activeReturn.refundAmount.toLocaleString("vi-VN")} ₫</p>
                                    <p style={{ margin: "0 0 8px 0" }}>
                                      <strong>Trạng thái phiếu:</strong>{" "}
                                      <span style={{ fontWeight: "bold", color: activeReturn.status === "Refunded" ? "#10B981" : activeReturn.status === "Rejected" ? "#EF4444" : "#F59E0B" }}>
                                        {activeReturn.status === "Requested" ? "Chờ duyệt" : activeReturn.status === "Refunded" ? "Đã hoàn tiền" : "Bị từ chối"}
                                      </span>
                                    </p>
                                    {activeReturn.status === "Requested" && (currentUser?.role === "admin" || currentUser?.role === "sales" || currentUser?.role === "staff") && (
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        <button className="button" style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#10B981" }} onClick={() => handleProcessReturn(activeReturn.id, "Refunded")}>
                                          Đồng ý & Hoàn kho
                                        </button>
                                        <button className="button" style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#EF4444" }} onClick={() => handleProcessReturn(activeReturn.id, "Rejected")}>
                                          Từ chối yêu cầu
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              } else if (order.orderStatus === "Delivered") {
                                return (
                                  <div className="order-detail-card">
                                    <button className="button" style={{ backgroundColor: "#F59E0B" }} onClick={() => handleRequestReturn(order.id)}>
                                      Yêu cầu trả hàng / Hoàn tiền
                                    </button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
