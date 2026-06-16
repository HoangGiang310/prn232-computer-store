import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  fetchVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../lib/api";
import { getAuth } from "../lib/auth";

type Voucher = {
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  totalUsageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
};

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("FixedAmount");
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [totalUsageLimit, setTotalUsageLimit] = useState(10);
  const [usedCount, setUsedCount] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "admin") {
      router.replace("/login?redirect=admin");
      return;
    }
    loadVouchers();
  }, []);

  async function loadVouchers() {
    try {
      const data = await fetchVouchers();
      setVouchers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách voucher.");
    }
  }

  function handleOpenCreate() {
    setEditMode(false);
    setCode("");
    setName("");
    setDiscountType("FixedAmount");
    setDiscountValue(0);
    setMinOrderValue(0);
    setTotalUsageLimit(10);
    setUsedCount(0);
    
    // Set default start today, end next month
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endStr = nextMonth.toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(endStr);

    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleOpenEdit(voucher: Voucher) {
    setEditMode(true);
    setCode(voucher.code);
    setName(voucher.name);
    setDiscountType(voucher.discountType);
    setDiscountValue(voucher.discountValue);
    setMinOrderValue(voucher.minOrderValue);
    setTotalUsageLimit(voucher.totalUsageLimit);
    setUsedCount(voucher.usedCount);
    
    // Format dates for input: YYYY-MM-DD
    setStartDate(new Date(voucher.startDate).toISOString().split("T")[0]);
    setEndDate(new Date(voucher.endDate).toISOString().split("T")[0]);

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
      code,
      name,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      totalUsageLimit: Number(totalUsageLimit),
      usedCount: Number(usedCount),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    try {
      const token = getAuth()?.token;
      if (editMode) {
        await updateVoucher(code, payload, token);
        setSuccess("Cập nhật voucher thành công.");
      } else {
        await createVoucher(payload, token);
        setSuccess("Tạo voucher mới thành công.");
      }
      setShowForm(false);
      loadVouchers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu voucher.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(codeStr: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa voucher ${codeStr}?`)) {
      return;
    }
    try {
      const token = getAuth()?.token;
      await deleteVoucher(codeStr, token);
      setSuccess(`Đã xóa voucher ${codeStr}.`);
      loadVouchers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa voucher.");
    }
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản lý Khuyến mãi & Voucher</h1>
        <p>Quản lý các mã giảm giá áp dụng khi thanh toán đơn hàng POS trực tiếp hoặc đặt hàng Online.</p>
      </section>

      <div className="buttons-group" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="button" onClick={() => router.back()}>
          Quay lại
        </button>
        <button className="button login-button" onClick={handleOpenCreate}>
          Tạo mã Voucher mới
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      {showForm ? (
        <section className="card">
          <h2>{editMode ? `Cập nhật voucher ${code}` : "Tạo voucher mới"}</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>
                Mã Voucher *
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={editMode}
                  placeholder="Ví dụ: LAPTOP2026"
                  required
                />
              </label>
              <label>
                Tên chương trình *
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Giảm giá hè 2026"
                  required
                />
              </label>
              <label>
                Loại giảm giá *
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  <option value="FixedAmount">Số tiền cố định (₫)</option>
                  <option value="Percentage">Tỷ lệ phần trăm (%)</option>
                </select>
              </label>
              <label>
                Giá trị giảm giá *
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  min={0}
                  required
                />
              </label>
              <label>
                Giá trị đơn hàng tối thiểu *
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  min={0}
                  required
                />
              </label>
              <label>
                Tổng số lượng sử dụng cho phép *
                <input
                  type="number"
                  value={totalUsageLimit}
                  onChange={(e) => setTotalUsageLimit(Number(e.target.value))}
                  min={1}
                  required
                />
              </label>
              <label>
                Ngày bắt đầu *
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Ngày kết thúc *
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
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

      <section className="card">
        <h2>Danh sách mã Voucher</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="products-table" style={{ width: "100%", fontSize: "14px" }}>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên chương trình</th>
                <th>Mức giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Đã dùng / Giới hạn</th>
                <th>Hiệu lực</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const startFormatted = new Date(v.startDate).toLocaleDateString("vi-VN");
                const endFormatted = new Date(v.endDate).toLocaleDateString("vi-VN");
                const isActive = new Date() >= new Date(v.startDate) && new Date() <= new Date(v.endDate) && v.usedCount < v.totalUsageLimit;
                return (
                  <tr key={v.code} style={{ opacity: isActive ? 1 : 0.6 }}>
                    <td><strong style={{ color: "#2563EB" }}>{v.code}</strong></td>
                    <td>{v.name}</td>
                    <td>
                      {v.discountType === "Percentage" 
                        ? `${v.discountValue}%` 
                        : `${v.discountValue.toLocaleString("vi-VN")} ₫`}
                    </td>
                    <td>{v.minOrderValue.toLocaleString("vi-VN")} ₫</td>
                    <td>{v.usedCount} / {v.totalUsageLimit}</td>
                    <td>
                      <span style={{ fontSize: "12px" }}>{startFormatted} - {endFormatted}</span>
                      <br />
                      <span 
                        style={{
                          fontSize: "11px",
                          color: isActive ? "#10B981" : "#EF4444",
                          fontWeight: "bold"
                        }}
                      >
                        {isActive ? "Đang hoạt động" : "Hết hạn/Hết lượt"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="button"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => handleOpenEdit(v)}
                        >
                          Sửa
                        </button>
                        <button
                          className="button"
                          style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#EF4444" }}
                          onClick={() => handleDelete(v.code)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    Chưa có voucher nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
