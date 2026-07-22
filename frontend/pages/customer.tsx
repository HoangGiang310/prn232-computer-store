import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { getAuth, logout } from "../lib/auth";
import AddressSelector from "../components/AddressSelector";
import {
  createOrder,
  fetchCurrentCustomer,
  fetchCurrentCustomerOrders,
  fetchProducts,
  cancelCustomerOrder,
  fetchVouchers,
  type OrderItemPayload,
} from "../lib/api";

type CartItem = {
  productId: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  stockQuantity: number;
  mainImage?: string;
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
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isPaid, setIsPaid] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  }

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
      const [customer, productList, orderHistory, voucherList] = await Promise.all([
        fetchCurrentCustomer(token),
        fetchProducts(),
        fetchCurrentCustomerOrders(token),
        fetchVouchers(),
      ]);

      setCustomerName(customer.fullName || customer.webUsername || customer.email || "Khách hàng");
      setShippingName(customer.fullName || "");
      setShippingPhone(customer.phoneNumber || "");
      setShippingAddress(customer.address || "");
      setProducts(productList);
      setOrders(orderHistory);

      const now = new Date();
      const active = (voucherList || []).filter((v: any) => {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        return now >= start && now <= end && v.usedCount < v.totalUsageLimit;
      });
      setVouchers(active);
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
    const mainImage =
      product.images?.find((img) => img.isMain)?.imageUrl ||
      product.images?.[0]?.imageUrl;

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
          mainImage,
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
        setOrders(Array.isArray(orderHistory) ? orderHistory : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder(order: any) {
    const confirmed = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Sản phẩm sẽ được hoàn tự động về kho.");
    if (!confirmed) return;
    if (!authToken) return;

    try {
      await cancelCustomerOrder(order, authToken);
      setSuccess("Hủy đơn hàng thành công!");
      const updatedOrders = await fetchCurrentCustomerOrders(authToken);
      setOrders(Array.isArray(updatedOrders) ? updatedOrders : []);
    } catch (err: any) {
      setError(err.message || "Không thể hủy đơn hàng.");
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
    <main className="dashboard-page dashboard-customer-page">
      <section className="dashboard-hero role-hero role-hero-customer">
        <div className="dashboard-hero-copy">
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
        </div>
      </section>

      <section className="card">
        <div className="role-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2>Sản phẩm</h2>
            <p>Khám phá laptop và linh kiện với thông tin giá và tồn kho rõ ràng.</p>
          </div>
          <form className="store-search-form" onSubmit={handleSearchSubmit} style={{ maxWidth: "380px" }}>
            <input
              type="text"
              className="store-search-input"
              placeholder="Nhập tên sản phẩm cần tìm kiếm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="store-search-button" aria-label="Tìm kiếm">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
        <div className="shop-grid">
          {products
            .filter((product) =>
              !searchQuery.trim()
                ? true
                : product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
            )
            .map((product) => {
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
                <div className="cart-item-content">
                  <div className="cart-item-media">
                    {item.mainImage ? (
                      <img src={item.mainImage} alt={item.name} />
                    ) : (
                      <div className="cart-item-media-fallback">💻</div>
                    )}
                  </div>
                  <div className="cart-item-details">
                    <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{item.name}</strong>
                    <p style={{ margin: "2px 0", fontSize: "0.88rem", color: "#64748b" }}>Giá: {item.unitPrice.toLocaleString("vi-VN")} ₫</p>
                    <p style={{ margin: "2px 0", fontSize: "0.82rem", color: "#94a3b8" }}>Tồn kho: {item.stockQuantity}</p>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <label className="cart-quantity-label">
                    <span>Số lượng</span>
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
            <p className="cart-summary">
              Tổng: {cartTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Thông tin giao nhận</h2>
        <form onSubmit={handleCheckout} className="auth-form customer-shipping-form">
          <div className="auth-form-grid">
            <label className="auth-field input-group">
              <span>Tên người nhận</span>
              <input
                type="text"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                required
              />
            </label>
            <label className="auth-field input-group">
              <span>Số điện thoại</span>
              <input
                type="text"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                required
              />
            </label>
            <div className="auth-field input-group" style={{ gridColumn: "span 2" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#475569" }}>Địa chỉ giao hàng *</span>
              <AddressSelector initialAddress={shippingAddress} onChange={setShippingAddress} />
            </div>
            <label className="auth-field input-group">
              <span>Phương thức thanh toán</span>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="E-Wallet">Ví điện tử</option>
                <option value="Card">Thẻ</option>
                <option value="Cash">Tiền mặt</option>
              </select>
            </label>
            <label className="auth-field input-group">
              <span>Chọn Voucher (tuỳ chọn)</span>
              <select
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              >
                <option value="">-- Không sử dụng voucher --</option>
                {vouchers.map((v: any) => {
                  const isEligible = cartTotal >= v.minOrderValue;
                  const discountDesc = v.discountType === "Percentage" ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString("vi-VN")} ₫`;
                  const condDesc = v.minOrderValue > 0 ? ` (Đơn tối thiểu ${Number(v.minOrderValue).toLocaleString("vi-VN")} ₫)` : "";
                  return (
                    <option key={v.code} value={v.code} disabled={!isEligible}>
                      {v.code} - Giảm {discountDesc}{condDesc} {!isEligible ? " [Không đủ điều kiện]" : ""}
                    </option>
                  );
                })}
              </select>
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
          <div className="order-list-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Đơn hàng #{order.id.substring(0, 8)}</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{order.orderStatus}</span>
                    {order.orderStatus === "New" && (
                      <button
                        type="button"
                        className="button"
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "11px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={() => handleCancelOrder(order)}
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
                <p>Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                <p>Phương thức: {order.paymentMethod}</p>
                <p>Thành tiền: {Number(order.finalAmount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                <p>Giao đến: {order.shippingAddress}</p>
                <div className="order-items-section" style={{ marginTop: "12px" }}>
                  <strong>Sản phẩm:</strong>
                  <div style={{ display: "grid", gap: "8px", marginTop: "6px" }}>
                    {order.orderItems?.map((item: any) => {
                      const matchedProduct = products.find((p) => p.id === item.productId);
                      const productImages = matchedProduct?.images || item.product?.images;
                      const mainImage =
                        productImages?.find((img: any) => img.isMain)?.imageUrl ||
                        productImages?.[0]?.imageUrl ||
                        item.imageUrl ||
                        item.productImage;
                      return (
                        <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                          <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                            {mainImage ? (
                              <img src={mainImage} alt={item.product?.name || item.productName || matchedProduct?.name || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f1f5f9' }}>💻</div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 600 }}>{item.product?.name || item.productName || matchedProduct?.name || `Sản phẩm ${item.productId}`}</span>
                            <span style={{ color: "#666", fontSize: "12px", marginLeft: "6px" }}>x{item.quantity}</span>
                          </div>
                          {(order.orderStatus === "Delivered" || order.orderStatus === "Confirmed") && item.productId ? (
                            <Link href={`/product/${item.productId}`} className="order-item-link" style={{ fontSize: "12px", color: "#1d4ed8" }}>
                              [Đánh giá]
                            </Link>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
