import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  fetchSalesReport,
  fetchTopSellingProducts,
  fetchInventoryStatusReport,
} from "../lib/api";
import { getAuth } from "../lib/auth";

type SalesReport = {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  onlineOrders: number;
  offlineOrders: number;
  dailyStats: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
};

type TopProduct = {
  productId: string;
  productCode: string;
  name: string;
  category?: string;
  brand: string;
  quantitySold: number;
  totalRevenue: number;
};

type InventoryStatus = {
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  normalStockCount: number;
  lowStockItems: Array<{
    id: string;
    productCode: string;
    name: string;
    category?: string;
    stockQuantity: number;
    lowStockThreshold: number;
  }>;
};

export default function ReportsPage() {
  const router = useRouter();
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [inventoryReport, setInventoryReport] = useState<InventoryStatus | null>(null);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth || (auth.role !== "admin" && auth.role !== "accountant" && auth.role !== "bookkeeper")) {
      router.replace("/login?redirect=bookkeeper");
      return;
    }

    // Default dates: last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);

    loadReports(start.toISOString().split("T")[0], end.toISOString().split("T")[0], auth.token);
  }, []);

  async function loadReports(start?: string, end?: string, token?: string) {
    setLoading(true);
    setError("");
    try {
      const startParam = start || startDate;
      const endParam = end || endDate;

      const [salesData, topData, invData] = await Promise.all([
        fetchSalesReport(startParam, endParam, token),
        fetchTopSellingProducts(5, token),
        fetchInventoryStatusReport(token),
      ]);

      setSalesReport(salesData);
      setTopProducts(topData);
      setInventoryReport(invData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const auth = getAuth();
    loadReports(undefined, undefined, auth?.token);
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Báo cáo & Thống kê tài chính</h1>
        <p>Kiểm tra doanh thu, lợi nhuận, thống kê laptop bán chạy và cảnh báo tồn kho thấp.</p>
      </section>

      <div className="buttons-group" style={{ marginBottom: "16px" }}>
        <button className="button" onClick={() => router.back()}>
          Quay lại
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <h2>Bộ lọc khoảng thời gian</h2>
        <form onSubmit={handleFilterSubmit} style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
          <div className="input-group" style={{ flexDirection: "row", gap: "16px", margin: 0, flex: 1 }}>
            <label style={{ flex: 1 }}>
              Từ ngày
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </label>
            <label style={{ flex: 1 }}>
              Đến ngày
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className="button login-button" disabled={loading} style={{ height: "42px" }}>
            {loading ? "Đang thống kê..." : "Thống kê"}
          </button>
        </form>
      </section>

      {salesReport && (
        <div className="hero-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" }}>
          <div className="card" style={{ borderLeft: "6px solid #10B981", textAlign: "center" }}>
            <h3 style={{ color: "#6B7280", margin: 0, fontSize: "14px", textTransform: "uppercase" }}>Doanh thu tổng</h3>
            <h1 style={{ color: "#10B981", margin: "8px 0 0 0" }}>
              {salesReport.totalRevenue.toLocaleString("vi-VN")} ₫
            </h1>
          </div>
          <div className="card" style={{ borderLeft: "6px solid #2563EB", textAlign: "center" }}>
            <h3 style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>Lợi nhuận ròng</h3>
            <h1 style={{ color: "#2563EB", margin: "8px 0 0 0" }}>
              {salesReport.totalProfit.toLocaleString("vi-VN")} ₫
            </h1>
          </div>
          <div className="card" style={{ borderLeft: "6px solid #F59E0B", textAlign: "center" }}>
            <h3 style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>Tổng số đơn hàng</h3>
            <h1 style={{ color: "#F59E0B", margin: "8px 0 0 0" }}>
              {salesReport.totalOrders} đơn hàng
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6B7280" }}>
              Online: {salesReport.onlineOrders} | Offline POS: {salesReport.offlineOrders}
            </p>
          </div>
        </div>
      )}

      <div className="hero-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", marginTop: "20px" }}>
        <section className="card">
          <h2>Biểu đồ doanh thu hàng ngày</h2>
          {salesReport && salesReport.dailyStats.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table className="products-table" style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Số đơn hàng</th>
                    <th style={{ textAlign: "right" }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.dailyStats.map((d) => (
                    <tr key={d.date}>
                      <td>{new Date(d.date).toLocaleDateString("vi-VN")}</td>
                      <td>{d.orderCount}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold", color: "#10B981" }}>
                        {d.revenue.toLocaleString("vi-VN")} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#6B7280" }}>Không có dữ liệu bán hàng cho khoảng thời gian này.</p>
          )}
        </section>

        <div>
          <section className="card">
            <h2>Sản phẩm bán chạy nhất</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topProducts.map((p, idx) => (
                <div
                  key={p.productId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      #{idx + 1} {p.name}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#6B7280" }}>
                      Mã: {p.productCode} | Loại: {p.category || "N/A"} | Hãng: {p.brand}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontWeight: "bold", color: "#2563EB" }}>x{p.quantitySold}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9CA3AF" }}>
                      {p.totalRevenue.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && <p style={{ textAlign: "center" }}>Chưa có đơn hàng nào.</p>}
            </div>
          </section>

          {inventoryReport && (
            <section className="card" style={{ marginTop: "20px" }}>
              <h2>Trạng thái kho hàng</h2>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "16px", fontSize: "14px" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, color: "#6B7280" }}>Tổng mẫu</p>
                  <h3 style={{ margin: 0 }}>{inventoryReport.totalProducts}</h3>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, color: "#EF4444" }}>Hết hàng</p>
                  <h3 style={{ margin: 0, color: "#EF4444" }}>{inventoryReport.outOfStockCount}</h3>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, color: "#F59E0B" }}>Sắp hết</p>
                  <h3 style={{ margin: 0, color: "#F59E0B" }}>{inventoryReport.lowStockCount}</h3>
                </div>
              </div>

              {inventoryReport.lowStockItems.length > 0 ? (
                <div>
                  <h4 style={{ color: "#B45309", margin: "0 0 8px 0" }}>⚠️ Cảnh báo tồn kho thấp</h4>
                  <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "13px", color: "#78350F" }}>
                    {inventoryReport.lowStockItems.map((item) => (
                      <li key={item.id} style={{ marginBottom: "4px" }}>
                      <strong>{item.productCode}</strong> - {item.name} ({item.category || "Không rõ"}): Còn {item.stockQuantity} (Ngưỡng: {item.lowStockThreshold})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ color: "#10B981", fontSize: "13px", margin: 0 }}>✓ Tồn kho ở mức an toàn.</p>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
