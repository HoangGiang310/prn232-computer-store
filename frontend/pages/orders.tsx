import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { fetchOrders, updateOrderStatus } from "../lib/api";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: {
    name: string;
    productCode: string;
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

  async function handleSaveStatus(order: Order) {
    const nextStatus = statusUpdates[order.id] || order.orderStatus;
    if (!nextStatus || nextStatus === order.orderStatus) return;
    setSavingId(order.id);
    setError("");

    try {
      await updateOrderStatus(order.id, { orderStatus: nextStatus });
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus && order.orderStatus !== selectedStatus) return false;
      if (selectedChannel && order.orderChannel !== selectedChannel)
        return false;
      return true;
    });
  }, [orders, selectedStatus, selectedChannel]);

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản lý đơn hàng</h1>
        <p>
          Xem danh sách đơn, theo dõi trạng thái và cập nhật đơn hàng cho kênh
          online/offline.
        </p>
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
        {error ? <p className="error">{error}</p> : null}
        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : filteredOrders.length === 0 ? (
          <p>Không có đơn hàng để hiển thị.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                          style={{ padding: "16px", background: "#f9fafb" }}
                        >
                          <div style={{ display: "grid", gap: "12px" }}>
                            <div>
                              <strong>Địa chỉ giao nhận:</strong>{" "}
                              {order.shippingName} | {order.shippingPhone} |{" "}
                              {order.shippingAddress}
                            </div>
                            <div>
                              <strong>Chi tiết sản phẩm:</strong>
                              <ul>
                                {order.orderItems?.map((item) => (
                                  <li key={item.id}>
                                    {item.product?.name ?? item.productId} x{" "}
                                    {item.quantity} @{" "}
                                    {item.unitPrice.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                  </li>
                                ))}
                              </ul>
                            </div>
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
