import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { getAuth, logout } from "../lib/auth";
import {
  createOrder,
  fetchCurrentCustomer,
  fetchCurrentCustomerOrders,
  fetchProducts,
  type OrderItemPayload,
} from "../lib/api";

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  stockQuantity: number;
};

type ProductOption = {
  id: string;
  productCode: string;
  name: string;
  category?: string;
  brand?: string;
  specifications?: string;
  price: number;
  stockQuantity: number;
  images?: Array<{ id: string; imageUrl: string; isMain?: boolean }>;
};

export default function CustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("E-Wallet");
  const [voucherCode, setVoucherCode] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "customer") {
      router.replace("/login?redirect=customer");
      return;
    }

    setAuthToken(auth.token);
    setCustomerName(auth.username);
    loadCustomerData(auth.token);
  }, [router]);

  async function loadCustomerData(token: string) {
    setLoading(true);
    setError("");
    try {
      const [customer, productList, orderHistory] = await Promise.all([
        fetchCurrentCustomer(token),
        fetchProducts(),
        fetchCurrentCustomerOrders(token),
      ]);

      setCustomerName(customer.fullName || customer.webUsername || customer.email || "Khách hàng");
      setShippingName(customer.fullName || "");
      setShippingPhone(customer.phoneNumber || "");
      setShippingAddress(customer.address || "");
      setProducts(productList);
      setOrders(orderHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu khách hàng.");
    } finally {
      setLoading(false);
    }
  }

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const activeOrders = orders.filter((order) =>
    ["New", "Confirmed", "Processing", "Shipping"].includes(order.orderStatus),
  ).length;

  function addToCart(product: ProductOption) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, item.stockQuantity),
              }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          category: product.category,
          quantity: 1,
          unitPrice: product.price,
          stockQuantity: product.stockQuantity,
        },
      ];
    });
  }

  function updateCartQuantity(productId: string, quantity: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.stockQuantity)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeCartItem(productId: string) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!authToken) {
      setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    if (cart.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
      return;
    }
    if (!shippingName || !shippingPhone || !shippingAddress) {
      setError("Vui lòng nhập đầy đủ thông tin giao nhận.");
      return;
    }

    const payload = {
      orderChannel: "Online",
      orderStatus: "New",
      paymentMethod,
      isPaid,
      shippingName,
      shippingPhone,
      shippingAddress,
      voucherCode: voucherCode || null,
      totalAmount: cartTotal,
      discountAmount: 0,
      shippingFee: 0,
      finalAmount: cartTotal,
      orderItems: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) as OrderItemPayload[],
    };

    try {
      setLoading(true);
      await createOrder(payload, authToken);
      setSuccess("Đơn hàng đã được gửi. Vui lòng chờ xác nhận.");
      setCart([]);
      setVoucherCode("");
      if (authToken) {
        const orderHistory = await fetchCurrentCustomerOrders(authToken);
        setOrders(orderHistory);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleRefresh() {
    if (!authToken) return;
    setRefreshing(true);
    loadCustomerData(authToken).finally(() => setRefreshing(false));
  }

  if (loading) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Khách hàng</h1>
          <p>Đang tải dữ liệu...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card role-hero role-hero-customer">
        <div className="role-pill">Vai trò: Khách hàng online</div>
        <h1>Xin chào, {customerName || "Khách hàng"}</h1>
        <p className="role-subtle">
          Theo dõi đơn hàng, đặt mua sản phẩm và quản lý thông tin giao nhận trong một trải nghiệm thân thiện.
        </p>
        <div className="role-stat-grid">
          <div className="role-stat-card">
            <strong>{orders.length}</strong>
            <span>Đơn hàng đã đặt</span>
          </div>
          <div className="role-stat-card">
            <strong>{activeOrders}</strong>
            <span>Đơn đang xử lý</span>
          </div>
          <div className="role-stat-card">
            <strong>{cart.length}</strong>
            <span>Sản phẩm trong giỏ</span>
          </div>
        </div>
        <div className="buttons-group" style={{ justifyContent: "flex-start", marginTop: "16px" }}>
          <button className="button" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Làm mới..." : "Làm mới dữ liệu"}
          </button>
          <button className="button" onClick={handleLogout}>
            Đăng xuất
          </button>
          <Link href="/" className="button back-button">
            Trang chủ
          </Link>
        </div>
      </section>

      <section className="card">
        <div className="role-section-title">
          <h2>Sản phẩm</h2>
          <p>Khám phá laptop và linh kiện với thông tin giá và tồn kho rõ ràng.</p>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
        <div className="shop-grid">
          {products.map((product) => {
            const mainImage =
              product.images?.find((img) => img.isMain)?.imageUrl ||
              product.images?.[0]?.imageUrl;
            const outOfStock = product.stockQuantity === 0;
            return (
              <article key={product.id} className="shop-card">
                <Link href={`/product/${product.id}`} className="shop-card-media">
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="shop-card-media-fallback">💻</div>
                  )}
                  {product.brand ? <span className="shop-card-brand">{product.brand}</span> : null}
                  {product.category ? <span className="shop-card-category">{product.category}</span> : null}
                  <span className={`shop-card-stock ${outOfStock ? "out" : "in"}`}>
                    {outOfStock ? "Hết hàng" : `Còn ${product.stockQuantity}`}
                  </span>
                </Link>
                <div className="shop-card-body">
                  <Link href={`/product/${product.id}`} className="shop-card-title">
                    {product.name}
                  </Link>
                  <p className="shop-card-code">{product.productCode}</p>
                  <p className="shop-card-price">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </p>
                  <div className="shop-card-actions">
                    <button
                      className="btn-primary"
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                    >
                      🛒 Thêm vào giỏ
                    </button>
                    <Link href={`/product/${product.id}`} className="btn-ghost">
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>Giỏ hàng</h2>
        {cart.length === 0 ? (
          <p>Giỏ hàng trống. Vui lòng chọn sản phẩm để đặt hàng.</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={item.productId} className="cart-item-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>Giá: {item.unitPrice.toLocaleString("vi-VN")} ₫</p>
                  <p>Kho: {item.stockQuantity}</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label>
                    Số lượng
                    <input
                      type="number"
                      min={1}
                      max={item.stockQuantity}
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.productId, Number(e.target.value))}
                    />
                  </label>
                  <button className="button" onClick={() => removeCartItem(item.productId)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
            <p style={{ marginTop: "12px", fontWeight: 600 }}>
              Tổng: {cartTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Thông tin giao nhận</h2>
        <form onSubmit={handleCheckout} className="login-form">
          <div className="input-group">
            <label>
              Tên người nhận
              <input
                type="text"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                required
              />
            </label>
            <label>
              Số điện thoại
              <input
                type="text"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                required
              />
            </label>
            <label>
              Địa chỉ giao hàng
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                required
              />
            </label>
            <label>
              Phương thức thanh toán
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="E-Wallet">Ví điện tử</option>
                <option value="Card">Thẻ</option>
                <option value="Cash">Tiền mặt</option>
              </select>
            </label>
            <label>
              Voucher (tuỳ chọn)
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
            </label>
          </div>
          <div className="buttons-group">
            <button type="submit" className="button login-button" disabled={cart.length === 0 || loading}>
              {loading ? "Đang đặt hàng..." : "Đặt hàng ngay"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Lịch sử đơn hàng</h2>
        {orders.length === 0 ? (
          <p>Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <strong>Đơn hàng #{order.id.substring(0, 8)}</strong>
                  <span>{order.orderStatus}</span>
                </div>
                <p>Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                <p>Phương thức: {order.paymentMethod}</p>
                <p>Thành tiền: {Number(order.finalAmount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                <p>Giao đến: {order.shippingAddress}</p>
                <div style={{ marginTop: "12px" }}>
                  <strong>Sản phẩm:</strong>
                  <ul>
                    {order.orderItems?.map((item: any) => (
                      <li key={item.productId}>
                        {item.product?.name ?? "Sản phẩm"} x{item.quantity}
                        {(order.orderStatus === "Delivered" || order.orderStatus === "Confirmed") && item.productId ? (
                          <>
                            {" "}
                            <Link href={`/product/${item.productId}`} style={{ color: "#2563eb" }}>
                              [Đánh giá]
                            </Link>
                          </>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
