import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../components/AdminHeader";
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
  category: string;
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
      if (auth?.token) {
        await loadInventory(auth.token);
      }
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
      [product.productCode, product.name, product.brand, product.category]
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
    <>
      <AdminHeader />
      <main className="main">
      <section className="card header">
        <h1>Quản Lý Kho Hàng</h1>
        <p>Quản lý tồn kho, điều chỉnh xuất nhập và xem lịch sử thay đổi.</p>
      </section>

      <section className="card stats-grid stats-grid-three">
        <div className="stat-card">
          <span className="stat-label">Tổng sản phẩm</span>
          <strong>{products.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sản phẩm cảnh báo</span>
          <strong className="stat-highlight">{lowStockProducts.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Thay đổi gần nhất</span>
          <strong>
            {history.length === 0
              ? "Chưa có giao dịch"
              : new Date(history[0].changeDate).toLocaleString("vi-VN")}
          </strong>
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

            <div className="search-box">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã, tên, hãng..."
              />
            </div>

            {loading ? (
              <p>Đang tải dữ liệu kho...</p>
            ) : (
              <div className="table-scroll">
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
                        <td>{product.category}</td>
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

          <div className="inventory-panel">
            <div className="inventory-panel-card">
              <div>
                <h2 className="section-title-center">Chỉnh Sửa Kho Hàng</h2>
                <p>Chọn sản phẩm, khai báo số lượng và lưu thay đổi.</p>

                <form onSubmit={handleSubmit} className="login-form">
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
                        Phân loại: {selectedProduct.category}
                      </p>
                      <p style={{ margin: "8px 0 0" }}>
                        Kho Hàng Hiện Tại: {selectedProduct.stockQuantity}
                      </p>
                    </div>
                  ) : null}

                  <div className="buttons-group buttons-group-full">
                    <button type="submit" className="button login-button" disabled={busy}>
                      {busy ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="buttons-group buttons-group-full">
                <Link href="/admin" className="button back-button">
                  Quay lại Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="order-card-header">
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
    </>
  );
}
