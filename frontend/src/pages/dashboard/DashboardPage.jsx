import { useEffect, useState } from "react";
import { fetchProducts } from "@/api/products.api";
import { fetchCustomers } from "@/api/customers.api";
import { fetchOrders } from "@/api/orders.api";

export default function DashboardPage({ token }) {
  const [summary, setSummary] = useState({
    products: 0,
    customers: 0,
    orders: 0,
  });
  const [lowStock, setLowStock] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          fetchProducts({}),
          fetchCustomers(token),
          fetchOrders(token),
        ]);

        setSummary({
          products: productsRes.data?.length || 0,
          customers: customersRes.data?.length || 0,
          orders: ordersRes.data?.length || 0,
        });

        setLowStock(
          (productsRes.data || [])
            .filter(
              (product) =>
                product.stock !== undefined &&
                product.stock > 0 &&
                product.stock < 5,
            )
            .slice(0, 5),
        );

        setLatestOrders((ordersRes.data || []).slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold text-slate-900">
          Bảng điều khiển
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Tổng quan hệ thống quản lý bán hàng laptop.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Sản phẩm</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              {summary.products}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Khách hàng</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              {summary.customers}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Đơn hàng</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              {summary.orders}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Sản phẩm sắp hết hàng
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Các mẫu laptop có tồn kho dưới 5 chiếc.
          </p>

          {loading ? (
            <div className="mt-8 text-slate-500">Đang tải...</div>
          ) : lowStock.length === 0 ? (
            <div className="mt-8 text-slate-500">
              Không có sản phẩm sắp hết.
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-600">
                    Hãng {product.brand} • {product.stock} chiếc còn lại
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Đơn hàng mới nhất
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Xem nhanh những đơn hàng gần đây.
          </p>

          {loading ? (
            <div className="mt-8 text-slate-500">Đang tải...</div>
          ) : latestOrders.length === 0 ? (
            <div className="mt-8 text-slate-500">Chưa có đơn hàng mới.</div>
          ) : (
            <div className="mt-6 space-y-3">
              {latestOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{order.code}</p>
                      <p className="font-semibold text-slate-900">
                        {order.customer?.name || "Khách lẻ"}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                    <span>{order.total.toLocaleString()} đ</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
