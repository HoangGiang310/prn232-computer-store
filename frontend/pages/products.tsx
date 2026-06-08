import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { getAuth } from "../lib/auth";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
  type ProductPayload,
} from "../lib/api";

type Product = ProductPayload & {
  id: string;
  images?: Array<{ id: string; imageUrl: string }>;
};

const initialProductForm: ProductPayload = {
  productCode: "",
  name: "",
  brand: "",
  specifications: "",
  importPrice: 0,
  price: 0,
  stockQuantity: 0,
  lowStockThreshold: 0,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductPayload>(initialProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = getAuth()?.token;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const productList = await fetchProducts();
      setProducts(productList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setFormData(initialProductForm);
    setShowForm(false);
    setError("");
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);
    setFormData({
      productCode: product.productCode,
      name: product.name,
      brand: product.brand,
      specifications: product.specifications,
      importPrice: product.importPrice,
      price: product.price,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: ProductPayload = {
        ...formData,
        importPrice: Number(formData.importPrice),
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };

      if (editingId) {
        await updateProduct(editingId, payload, token);
      } else {
        await createProduct(payload, token);
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    setError("");
    setLoading(true);

    try {
      await deleteProduct(id, token);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi xóa sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.productCode.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.specifications.toLowerCase().includes(query)
      );
    });
  }, [products, searchTerm]);

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản lý sản phẩm</h1>
        <p>
          Quản lý danh sách sản phẩm, tạo mới, sửa thông tin và theo dõi tồn
          kho.
        </p>
      </section>

      <section className="card">
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="button" onClick={() => setShowForm(true)}>
            Thêm sản phẩm mới
          </button>
          <Link href="/admin" className="button">
            Quay lại Admin
          </Link>
        </div>

        <div style={{ marginTop: "20px" }}>
          <label>
            Tìm kiếm sản phẩm
            <input
              type="text"
              placeholder="Nhập tên, mã, hãng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", marginTop: "8px", padding: "12px 16px" }}
            />
          </label>
        </div>
      </section>

      {showForm ? (
        <section className="card">
          <h2>{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
          <form onSubmit={handleSave} className="login-form">
            <div className="input-group">
              <label>
                Mã sản phẩm
                <input
                  type="text"
                  value={formData.productCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      productCode: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Tên sản phẩm
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Hãng
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Cấu hình
                <textarea
                  value={formData.specifications}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specifications: e.target.value,
                    }))
                  }
                  rows={4}
                  required
                />
              </label>
              <label>
                Giá nhập
                <input
                  type="number"
                  step="0.01"
                  value={formData.importPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      importPrice: Number(e.target.value),
                    }))
                  }
                  required
                />
              </label>
              <label>
                Giá bán
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                  required
                />
              </label>
              <label>
                Tồn kho
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stockQuantity: Number(e.target.value),
                    }))
                  }
                  required
                />
              </label>
              <label>
                Ngưỡng cảnh báo tồn kho
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lowStockThreshold: Number(e.target.value),
                    }))
                  }
                  required
                />
              </label>
            </div>

            {error ? <p className="error">{error}</p> : null}

            <div className="buttons-group">
              <button
                type="submit"
                className="button login-button"
                disabled={loading}
              >
                {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu"}
              </button>
              <button
                type="button"
                className="button register-button"
                onClick={resetForm}
              >
                Hủy
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="card">
        <h2>Danh sách sản phẩm</h2>
        {error ? <p className="error">{error}</p> : null}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : filteredProducts.length === 0 ? (
          <p>Không có sản phẩm để hiển thị.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Mã SP</th>
                  <th>Tên</th>
                  <th>Hãng</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Ngưỡng cảnh báo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
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
                    <td>
                      <button
                        className="button"
                        onClick={() => handleEdit(product)}
                      >
                        Sửa
                      </button>
                      <button
                        className="button register-button"
                        onClick={() => handleDelete(product.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
