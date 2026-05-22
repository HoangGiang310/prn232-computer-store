import { useEffect, useMemo, useState } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/products.api";
import { Button } from "@/components/ui/button";

const emptyForm = {
  name: "",
  brand: "",
  cpu: "",
  ram: "",
  storage: "",
  display: "",
  price: "",
  costPrice: "",
  stock: "",
  images: "",
};

const emptyFilters = {
  search: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  stockStatus: "",
};

export default function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadProducts = async (query = {}) => {
    setLoading(true);
    try {
      const response = await fetchProducts(query);
      setProducts(response.data || []);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadProducts(filters);
    };

    load();
  }, [filters]);

  const handleFormChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        cpu: form.cpu,
        ram: form.ram,
        storage: form.storage,
        display: form.display,
        price: Number(form.price),
        costPrice: Number(form.costPrice),
        stock: Number(form.stock),
        images: form.images
          ? form.images.split(",").map((item) => item.trim())
          : [],
      };

      if (editingId) {
        await updateProduct(editingId, payload, token);
        setMessage("Cập nhật sản phẩm thành công.");
      } else {
        await createProduct(payload, token);
        setMessage("Thêm sản phẩm mới thành công.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadProducts(filters);
    } catch (error) {
      setMessage(error.message || "Lưu sản phẩm thất bại.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      cpu: product.cpu || "",
      ram: product.ram || "",
      storage: product.storage || "",
      display: product.display || "",
      price: product.price?.toString() || "",
      costPrice: product.costPrice?.toString() || "",
      stock: product.stock?.toString() || "",
      images: product.images ? product.images.split(",").join(", ") : "",
    });
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa sản phẩm này?")) {
      return;
    }

    try {
      await deleteProduct(id, token);
      setMessage("Xóa sản phẩm thành công.");
      if (editingId === id) {
        handleCancelEdit();
      }
      await loadProducts(filters);
    } catch (error) {
      setMessage(error.message || "Xóa sản phẩm thất bại.");
    }
  };

  const brands = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.brand).filter(Boolean)),
      ),
    [products],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Quản lý sản phẩm Laptop
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Thêm, sửa, xóa, tìm kiếm và lọc các mẫu laptop trong kho.
            </p>
          </div>
          <Button
            onClick={() => loadProducts(filters)}
            variant="secondary"
            size="sm"
          >
            Làm mới
          </Button>
        </div>

        {message ? (
          <div className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Tên laptop", key: "name", type: "text" },
            { label: "Hãng", key: "brand", type: "text" },
            { label: "CPU", key: "cpu", type: "text" },
            { label: "RAM", key: "ram", type: "text" },
            { label: "Ổ cứng", key: "storage", type: "text" },
            { label: "Màn hình", key: "display", type: "text" },
            { label: "Giá bán (VNĐ)", key: "price", type: "number" },
            { label: "Giá vốn (VNĐ)", key: "costPrice", type: "number" },
            { label: "Tồn kho", key: "stock", type: "number" },
            {
              label: "Ảnh (URL, cách nhau bằng dấu phẩy)",
              key: "images",
              type: "text",
            },
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-medium text-slate-700">
                {field.label}
              </span>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(e) => handleFormChange(field.key, e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          ))}

          <div className="md:col-span-3 flex flex-wrap items-center gap-3 justify-end">
            {editingId ? (
              <>
                <Button type="submit">Cập nhật sản phẩm</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <Button type="submit">Thêm sản phẩm mới</Button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_240px_240px_240px]">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Tìm kiếm
            </label>
            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                handleFilterChange("search", event.target.value)
              }
              placeholder="Tên / mã / hãng / CPU / RAM"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Hãng
            </label>
            <select
              value={filters.brand}
              onChange={(event) =>
                handleFilterChange("brand", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Tất cả hãng</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Giá từ
              <input
                type="number"
                value={filters.minPrice}
                onChange={(event) =>
                  handleFilterChange("minPrice", event.target.value)
                }
                placeholder="0"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Giá đến
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(event) =>
                  handleFilterChange("maxPrice", event.target.value)
                }
                placeholder="0"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Trạng thái kho
            </label>
            <select
              value={filters.stockStatus}
              onChange={(event) =>
                handleFilterChange("stockStatus", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Tất cả</option>
              <option value="in_stock">Còn hàng</option>
              <option value="low_stock">Sắp hết</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Hãng</th>
                <th className="px-4 py-3">CPU</th>
                <th className="px-4 py-3">RAM</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Chưa có sản phẩm nào phù hợp.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">
                      {product.slug || `#${product.id}`}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3">{product.brand}</td>
                    <td className="px-4 py-3">{product.cpu || "–"}</td>
                    <td className="px-4 py-3">{product.ram || "–"}</td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {product.price.toLocaleString()} đ
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {product.stock ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {product.stock === 0 ? (
                        <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                          Hết hàng
                        </span>
                      ) : product.stock < 5 ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Sắp hết
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Còn hàng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
