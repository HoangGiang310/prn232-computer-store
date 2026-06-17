import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { getAuth } from "../lib/auth";
import {
  adjustInventory,
  fetchInventoryHistory,
  fetchInventoryProducts,
  type InventoryAdjustmentPayload,
} from "../lib/api";

type InventoryProduct = {
  id: string;
  productCode: string;
  name: string;
  brand: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
};

type InventoryHistoryItem = {
  id: string;
  changeType: string;
  quantityChanged: number;
  newStock: number;
  note: string;
  changeDate: string;
  changedById?: string;
  product?: {
    name: string;
    productCode: string;
  };
};

const adjustmentTypes = [
  "Import",
  "Export_POS",
  "Export_Online",
  "Adjustment",
  "Return",
];

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [history, setHistory] = useState<InventoryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantityChanged, setQuantityChanged] = useState(0);
  const [changeType, setChangeType] = useState("Import");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token || !["admin", "warehouse", "sales"].includes(auth.role)) {
      window.location.href = "/login?redirect=manager";
      return;
    }

    loadInventory(auth.token);
  }, []);

  async function loadInventory(token: string) {
    setLoading(true);
    setError("");

    try {
      const [productsData, historyData] = await Promise.all([
        fetchInventoryProducts(token),
        fetchInventoryHistory(token),
      ]);
      setProducts(productsData);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu kho.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProductId) {
      setError("Vui lòng chọn sản phẩm để điều chỉnh.");
      return;
    }

    setBusy(true);
    setError("");

    const auth = getAuth();
    const payload: InventoryAdjustmentPayload = {
      productId: selectedProductId,
      quantityChanged,
      changeType,
      note: note || "Điều chỉnh kho thủ công",
    };

    try {
      await adjustInventory(payload, auth?.token);
      await loadInventory();
      setSelectedProductId("");
      setQuantityChanged(0);
      setChangeType("Import");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể điều chỉnh tồn kho.");
    } finally {
      setBusy(false);
    }
  }

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId),
    [products, selectedProductId],
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.productCode, product.name, product.brand]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [products, searchTerm]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stockQuantity <= product.lowStockThreshold),
    [products],
  );

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản Lý Kho Hàng</h1>
        <p>Quản lý tồn kho, điều chỉnh xuất nhập và xem lịch sử thay đổi.</p>
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
            <h3>Tổng sản phẩm</h3>
            <p style={{ fontSize: "32px", margin: "12px 0 0" }}>{products.length}</p>
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
            <h3>Sản phẩm cảnh báo</h3>
            <p style={{ fontSize: "32px", margin: "12px 0 0", color: "#b91c1c" }}>
              {lowStockProducts.length}
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
            <h3>Thay đổi gần nhất</h3>
            <p style={{ margin: "12px 0 0" }}>
              {history.length === 0
                ? "Chưa có giao dịch"
                : new Date(history[0].changeDate).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: "320px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 className="section-title-center">Kho Hàng Hiện Tại</h2>
                <p>Hiển thị tất cả sản phẩm đang quản lý trong kho.</p>
              </div>
            </div>

            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã, tên, hãng..."
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>

            {loading ? (
              <p>Đang tải dữ liệu kho...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Mã SP</th>
                      <th>Tên</th>
                      <th>Hãng</th>
                      <th style={{ textAlign: "right" }}>Giá</th>
                      <th style={{ textAlign: "right" }}>Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className={product.stockQuantity <= product.lowStockThreshold ? 'low-stock' : ''}>
                        <td>{product.productCode}</td>
                        <td>{product.name}</td>
                        <td>{product.brand}</td>
                        <td className="price-cell" style={{ textAlign: "right" }}>
                          {product.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </td>
                        <td style={{ textAlign: "right" }}>{product.stockQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: "320px", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px", borderRadius: "16px", background: "#f8fafc", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <h2 className="section-title-center">Chỉnh Sửa Kho Hàng</h2>
                <p>Chọn sản phẩm, khai báo số lượng và lưu thay đổi.</p>

                <form onSubmit={handleSubmit} className="login-form" style={{ marginTop: "16px" }}>
                  <div className="input-group">
                    <label>
                      Sản phẩm
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        required
                      >
                        <option value="">Chọn sản phẩm</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.productCode} - {product.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Loại điều chỉnh
                      <select value={changeType} onChange={(e) => setChangeType(e.target.value)}>
                        {adjustmentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Số lượng (+ nhập, - xuất)
                      <input
                        type="number"
                        value={quantityChanged}
                        onChange={(e) => setQuantityChanged(Number(e.target.value))}
                        required
                      />
                    </label>

                    <label>
                      Ghi chú
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="Lý do điều chỉnh"
                      />
                    </label>
                  </div>

                  {selectedProduct ? (
                    <div className="inventory-selected-card">
                      <strong>Thông tin sản phẩm:</strong>
                      <p style={{ margin: "8px 0 0" }}>
                        {selectedProduct.productCode} - {selectedProduct.name}
                      </p>
                      <p style={{ margin: "8px 0 0" }}>
                        Kho Hàng Hiện Tại: {selectedProduct.stockQuantity}
                      </p>
                    </div>
                  ) : null}

                  <div className="buttons-group" style={{ width: "100%" }}>
                    <button type="submit" className="button login-button" disabled={busy} style={{ width: "100%" }}>
                      {busy ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
              <div style={{ marginTop: "16px", width: "100%", display: "flex", justifyContent: "center" }}>
                <Link href="/admin" className="button" style={{ display: "inline-flex", justifyContent: "center" }}>
                  Quay lại Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="section-title-center">Lịch Sử Chỉnh Sửa</h2>
            <p>Xem lại các thao tác nhập, xuất và điều chỉnh tồn kho.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <p>Chưa có lịch sử điều chỉnh.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
            {history.map((item) => (
              <div key={item.id} className="history-item-card">
                <div className="history-item-grid">
                  <div className="history-field-box">
                    <div className="history-field-label">Thời gian</div>
                    <div className="history-field-value">{new Date(item.changeDate).toLocaleString("vi-VN")}</div>
                  </div>

                  <div className="history-field-box">
                    <div className="history-field-label">Sản phẩm</div>
                    <div className="history-field-value">{item.product ? `${item.product.productCode} - ${item.product.name}` : "N/A"}</div>
                  </div>

                  <div className="history-field-box">
                    <div className="history-field-label">Loại</div>
                    <div className="history-field-value">{item.changeType}</div>
                  </div>

                  <div className="history-field-box">
                    <div className="history-field-label">Thay đổi</div>
                    <div className="history-field-value">{item.quantityChanged}</div>
                  </div>

                  <div className="history-field-box">
                    <div className="history-field-label">Tồn mới</div>
                    <div className="history-field-value">{item.newStock}</div>
                  </div>

                  {item.note ? (
                    <div className="history-field-box">
                      <div className="history-field-label">Ghi chú</div>
                      <div className="history-field-value">{item.note}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
