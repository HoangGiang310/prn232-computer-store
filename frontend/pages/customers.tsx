import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  fetchCustomers,
  fetchCustomerOrders,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../lib/api";
import { getAuth } from "../lib/auth";

type Customer = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  notes: string;
  webUsername: string;
  createdAt: string;
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [webUsername, setWebUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth || (auth.role !== "admin" && auth.role !== "sales" && auth.role !== "staff")) {
      router.replace("/login?redirect=admin");
      return;
    }
    loadCustomers();
  }, [search]);

  async function loadCustomers() {
    try {
      const data = await fetchCustomers(search);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải khách hàng.");
    }
  }

  async function handleViewHistory(customer: Customer) {
    setSelectedCustomer(customer);
    try {
      const orders = await fetchCustomerOrders(customer.id);
      setHistoryOrders(orders);
    } catch (err) {
      setError("Không thể tải lịch sử mua hàng.");
    }
  }

  function handleOpenCreate() {
    setEditMode(false);
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setAddress("");
    setNotes("");
    setWebUsername("");
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleOpenEdit(customer: Customer) {
    setEditMode(true);
    setSelectedCustomer(customer);
    setFullName(customer.fullName);
    setPhoneNumber(customer.phoneNumber);
    setEmail(customer.email || "");
    setAddress(customer.address || "");
    setNotes(customer.notes || "");
    setWebUsername(customer.webUsername || "");
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = {
      fullName,
      phoneNumber,
      email,
      address,
      notes,
      webUsername,
    };

    try {
      const token = getAuth()?.token;
      if (editMode && selectedCustomer) {
        await updateCustomer(selectedCustomer.id, payload, token);
        setSuccess("Cập nhật khách hàng thành công.");
      } else {
        await createCustomer(payload, token);
        setSuccess("Tạo khách hàng mới thành công.");
      }
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này? Tất cả lịch sử đơn hàng của họ vẫn được giữ lại.")) {
      return;
    }
    try {
      const token = getAuth()?.token;
      await deleteCustomer(id, token);
      setSuccess("Đã xóa khách hàng.");
      loadCustomers();
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa khách hàng.");
    }
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản lý khách hàng</h1>
        <p>Thao tác thêm, sửa, xóa thông tin khách và theo dõi lịch sử mua hàng.</p>
      </section>

      <div className="buttons-group" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="button" onClick={() => router.back()}>
          Quay lại
        </button>
        <button className="button login-button" onClick={handleOpenCreate}>
          Thêm khách hàng
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      {showForm ? (
        <section className="card">
          <h2>{editMode ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>
                Họ và tên *
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>
              <label>
                Số điện thoại *
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Tên đăng nhập (Web)
                <input
                  type="text"
                  value={webUsername}
                  onChange={(e) => setWebUsername(e.target.value)}
                  placeholder="Mặc định là customer_SĐT"
                />
              </label>
              <label>
                Địa chỉ giao hàng
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
              <label>
                Ghi chú nội bộ
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </label>
            </div>
            <div className="buttons-group" style={{ marginTop: "16px" }}>
              <button type="submit" className="button login-button" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu lại"}
              </button>
              <button type="button" className="button" onClick={() => setShowForm(false)}>
                Hủy
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="hero-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <section className="card">
          <h2>Danh sách khách hàng</h2>
          <div className="input-group" style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Tìm theo Tên, SĐT, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="products-table" style={{ width: "100%", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span
                        style={{ cursor: "pointer", color: "#2563EB", fontWeight: "bold" }}
                        onClick={() => handleViewHistory(c)}
                      >
                        {c.fullName}
                      </span>
                    </td>
                    <td>{c.phoneNumber}</td>
                    <td>{c.address || "Chưa có"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="button"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => handleOpenEdit(c)}
                        >
                          Sửa
                        </button>
                        <button
                          className="button"
                          style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#EF4444" }}
                          onClick={() => handleDelete(c.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2>Lịch sử mua hàng và thông tin</h2>
          {selectedCustomer ? (
            <div>
              <div style={{ backgroundColor: "#F3F4F6", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                <p><strong>Khách hàng:</strong> {selectedCustomer.fullName}</p>
                <p><strong>SĐT:</strong> {selectedCustomer.phoneNumber}</p>
                <p><strong>Email:</strong> {selectedCustomer.email || "N/A"}</p>
                <p><strong>Địa chỉ mặc định:</strong> {selectedCustomer.address || "N/A"}</p>
                <p><strong>Ghi chú nội bộ:</strong> <span style={{ color: "#D97706" }}>{selectedCustomer.notes || "Không có"}</span></p>
              </div>

              <h3>Đơn hàng đã đặt ({historyOrders.length})</h3>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {historyOrders.map((o: any) => (
                  <div
                    key={o.id}
                    style={{
                      borderBottom: "1px solid #E5E7EB",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        Đơn {o.orderChannel} - {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6B7280" }}>
                        {o.orderItems.map((oi: any) => `${oi.product?.name || "Laptop"}${oi.product?.category ? ` (${oi.product.category})` : ""} x${oi.quantity}`).join(", ")}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontWeight: "bold", color: "#10B981" }}>
                        {o.finalAmount.toLocaleString("vi-VN")} ₫
                      </p>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor:
                            o.orderStatus === "Delivered"
                              ? "#D1FAE5"
                              : o.orderStatus === "Cancelled"
                              ? "#FEE2E2"
                              : "#FEF3C7",
                          color:
                            o.orderStatus === "Delivered"
                              ? "#065F46"
                              : o.orderStatus === "Cancelled"
                              ? "#991B1B"
                              : "#92400E",
                        }}
                      >
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {historyOrders.length === 0 && <p>Chưa có đơn hàng nào.</p>}
              </div>
            </div>
          ) : (
            <p style={{ color: "#6B7280", textAlign: "center", marginTop: "40px" }}>
              Hãy nhấn vào tên khách hàng bên trái để xem chi tiết thông tin và lịch sử mua hàng.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
