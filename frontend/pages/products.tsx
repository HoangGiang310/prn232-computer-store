import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../components/AdminHeader";
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
  category: "",
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
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductPayload>(initialProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const productList = await fetchProducts({
        search: searchTerm,
        brand: selectedBrand,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        stockStatus,
      });
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
      category: product.category ?? "",
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

    // Validation phía client trước khi gửi
    const code = formData.productCode.trim();
    const name = formData.name.trim();
    const brand = formData.brand.trim();
    const specs = formData.specifications.trim();

    if (!code || !name || !formData.category.trim() || !brand || !specs) {
      setError("Vui lòng nhập đầy đủ: mã, tên, phân loại, hãng và cấu hình sản phẩm.");
      return;
    }
    if (Number(formData.importPrice) < 0 || Number(formData.price) < 0) {
      setError("Giá nhập và giá bán không được âm.");
      return;
    }
    if (Number(formData.price) < Number(formData.importPrice)) {
      setError("Giá bán không được nhỏ hơn giá nhập.");
      return;
    }
    if (Number(formData.stockQuantity) < 0 || Number(formData.lowStockThreshold) < 0) {
      setError("Tồn kho và ngưỡng cảnh báo không được âm.");
      return;
    }

    setLoading(true);

    try {
      const payload: ProductPayload = {
        ...formData,
        productCode: code,
        name,
        category: formData.category.trim(),
        brand,
        specifications: specs,
        importPrice: Number(formData.importPrice),
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
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
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi xóa sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedBrand, minPrice, maxPrice, stockStatus]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  const lowStockCount = useMemo(
    () => products.filter((product) => product.stockQuantity <= product.lowStockThreshold).length,
    [products],
  );

  return (
    <>
      <AdminHeader />
      <main className="main products-page">
      <section className="card header">
        <h1>Quản lý sản phẩm</h1>
        <p>Quản lý danh sách sản phẩm, giá bán và tồn kho theo phong cách showroom.</p>
      </section>

      <section className="card stats-grid">
        <div className="stat-card">
          <span className="stat-label">Tổng sản phẩm</span>
          <strong>{products.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sản phẩm cảnh báo</span>
          <strong>{lowStockCount}</strong>
        </div>
      </section>

      <section className="card filter-card">
        <div className="filter-header">
          <div>
            <h2>Tiện ích tìm kiếm</h2>
            <p>Lọc theo tên, hãng, giá và trạng thái kho để tìm sản phẩm nhanh hơn.</p>
          </div>
          <div className="button-group">
            <button className="button" onClick={() => setShowForm(true)}>
              Thêm sản phẩm mới
            </button>
            <Link href="/admin" className="button secondary">
              Quay lại Admin
            </Link>
          </div>
        </div>

        <div className="filter-grid">
          <label className="input-group">
            <span>Tìm kiếm sản phẩm</span>
            <input
              type="text"
              placeholder="Tên, mã, hãng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Hãng</span>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
              <option value="">Tất cả</option>
              {[...new Set(products.map((p) => p.brand))].sort().map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>Giá tối thiểu</span>
            <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </label>

          <label className="input-group">
            <span>Giá tối đa</span>
            <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </label>

          <label className="input-group">
            <span>Trạng thái kho</span>
            <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="instock">Còn hàng</option>
              <option value="lowstock">Gần hết</option>
              <option value="outofstock">Hết hàng</option>
            </select>
          </label>
        </div>
      </section>

      {showForm ? (
        <section className="card product-form">
          <div className="filter-header">
            <div>
              <h2>{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <p>Nhập thông tin chi tiết sản phẩm: mã, tên, hãng, cấu hình và tồn kho.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="login-form" style={{ marginTop: "24px" }}>
            <div style={{ display: "grid", gap: "18px", width: "100%", maxWidth: "780px" }}>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Mã sản phẩm</span>
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
                  style={{ flex: 1, minWidth: "280px" }}
                />
              </label>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Tên sản phẩm</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  style={{ flex: 1, minWidth: "280px" }}
                />
              </label>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Hãng</span>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  required
                  style={{ flex: 1, minWidth: "280px" }}
                />
              </label>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Phân loại</span>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                  style={{ flex: 1, minWidth: "280px", padding: "12px 16px" }}
                >
                  <option value="">Chọn phân loại</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Chuột có dây">Chuột có dây</option>
                  <option value="Chuột không dây">Chuột không dây</option>
                  <option value="Bàn phím có dây">Bàn phím có dây</option>
                  <option value="Bàn phím không dây">Bàn phím không dây</option>
                  <option value="Giá kê laptop">Giá kê laptop</option>
                </select>
              </label>
              <label className="product-field-card" style={{ display: "grid", gap: "10px", maxWidth: "50%" }}>
                <span style={{ fontWeight: 600 }}>Cấu hình</span>
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
                  style={{ width: "100%", minHeight: "110px" }}
                />
              </label>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Giá nhập</span>
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
                  style={{ flex: 1, minWidth: "280px", textAlign: "center" }}
                />
              </label>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Giá bán</span>
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
                  style={{ flex: 1, minWidth: "280px", textAlign: "center" }}
                />
              </label>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Tồn kho</span>
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
                  style={{ flex: 1, minWidth: "280px", textAlign: "center" }}
                />
              </label>
              <label className="product-field-card" style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "space-between" }}>
                <span style={{ minWidth: "180px", fontWeight: 600 }}>Ngưỡng cảnh báo tồn kho</span>
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
                  style={{ flex: 1, minWidth: "280px", textAlign: "center" }}
                />
              </label>
            </div>

            {error ? <p className="error">{error}</p> : null}

            <div className="buttons-group">
              <button type="submit" className="button" disabled={loading}>
                {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu"}
              </button>
              <button type="button" className="button secondary" onClick={resetForm}>
                Hủy
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="card">
        <h2 className="product-list-title">Danh sách sản phẩm</h2>
        {error ? <p className="error">{error}</p> : null}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : filteredProducts.length === 0 ? (
          <p>Không có sản phẩm để hiển thị.</p>
        ) : (
          <div className="table-scroll">
            <table className="product-list-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Mã SP</th>
                  <th>Tên</th>
                  <th>Phân loại</th>
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
                    <td>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0].imageUrl} alt={product.name} className="table-thumb" />
                      ) : (
                        <div className="table-thumb table-thumb-fallback">💻</div>
                      )}
                    </td>
                    <td>{product.productCode}</td>
                    <td>
                      <Link href={`/products/${product.id}`} className="product-link">
                        {product.name}
                      </Link>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.lowStockThreshold}</td>
                    <td className="action-buttons-cell">
                      <div className="action-buttons-column">
                        <button className="button product-action-button" onClick={() => handleEdit(product)}>
                          Sửa
                        </button>
                        <button className="button secondary product-action-button" onClick={() => handleDelete(product.id)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
    </>
  );
}
