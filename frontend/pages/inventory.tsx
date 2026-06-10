import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    setError("");

    try {
      const [productsData, historyData] = await Promise.all([
        fetchInventoryProducts(),
        fetchInventoryHistory(),
      ]);
      setProducts(productsData);
      setHistory(historyData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải dữ liệu kho.",
      );
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

    const payload: InventoryAdjustmentPayload = {
      productId: selectedProductId,
      quantityChanged,
      changeType,
      note: note || "Điều chỉnh kho thủ công",
    };

    try {
      await adjustInventory(payload);
      await loadInventory();
      setSelectedProductId("");
      setQuantityChanged(0);
      setChangeType("Import");
      setNote("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể điều chỉnh tồn kho.",
      );
    } finally {
      setBusy(false);
    }
  }

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) => product.stockQuantity <= product.lowStockThreshold,
      ),
    [products],
  );

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản lý kho</h1>
        <p>
          Theo dõi tồn kho, điều chỉnh nhập xuất và lưu lịch sử thay đổi kho.
        </p>
      </section>

      <section className="card">
        <div className="buttons-group" style={{ justifyContent: "flex-start" }}>
          <Link href="/admin" className="button">
            Quay lại Admin
          </Link>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div style={{ display: "grid", gap: "24px", marginTop: "24px" }}>
          <div>
            <h2>Tồn kho hiện tại</h2>
            {loading ? (
              <p>Đang tải dữ liệu kho...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Mã SP</th>
                      <th>Tên</th>
                      <th>Hãng</th>
                      <th>Giá</th>
                      <th>Tồn kho</th>
                      <th>Ngưỡng cảnh báo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        style={
                          product.stockQuantity <= product.lowStockThreshold
                            ? { background: "#fef2f2" }
                            : {}
                        }
                      >
                        <td>{product.productCode}</td>
                        <td>{product.name}</td>
                        <td>{product.brand}</td>
                        <td>
                          {product.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </td>
                        <td>{product.stockQuantity}</td>
                        <td>{product.lowStockThreshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2>Điều chỉnh tồn kho</h2>
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
                  <select
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                  >
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
              <div className="buttons-group">
                <button
                  type="submit"
                  className="button login-button"
                  disabled={busy}
                >
                  {busy ? "Đang lưu..." : "Ghi điều chỉnh"}
                </button>
              </div>
            </form>
          </div>

          <div>
            <h2>Lịch sử điều chỉnh kho</h2>
            {history.length === 0 ? (
              <p>Chưa có lịch sử điều chỉnh.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Sản phẩm</th>
                      <th>Loại</th>
                      <th>Thay đổi</th>
                      <th>Tồn mới</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {new Date(item.changeDate).toLocaleString("vi-VN")}
                        </td>
                        <td>
                          {item.product
                            ? `${item.product.productCode} - ${item.product.name}`
                            : "N/A"}
                        </td>
                        <td>{item.changeType}</td>
                        <td>{item.quantityChanged}</td>
                        <td>{item.newStock}</td>
                        <td>{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
