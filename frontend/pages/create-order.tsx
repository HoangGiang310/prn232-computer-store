import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import {
  createOrder,
  fetchProducts,
  type OrderItemPayload,
  type OrderPayload,
} from "../lib/api";

type ProductOption = {
  id: string;
  productCode: string;
  name: string;
  category?: string;
  price: number;
  stockQuantity: number;
};

type OrderLineItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

const defaultLineItem = (): OrderLineItem => ({
  id: crypto.randomUUID(),
  productId: "",
  quantity: 1,
  unitPrice: 0,
});

const orderChannels = ["Online", "Offline"];
const paymentMethods = ["Cash", "Card", "E-Wallet"];

export default function CreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [items, setItems] = useState<OrderLineItem[]>([defaultLineItem()]);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderChannel, setOrderChannel] = useState("Online");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [voucherCode, setVoucherCode] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const items = await fetchProducts();
      setProducts(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải sản phẩm.");
    }
  }

  const orderItems = useMemo(() => {
    return items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) as OrderItemPayload[];
  }, [items]);

  const totalAmount = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
  }, [orderItems]);

  const payload: OrderPayload = {
    orderChannel,
    orderStatus: orderChannel === "Offline" ? "Delivered" : "New",
    paymentMethod,
    isPaid,
    shippingName,
    shippingPhone,
    shippingAddress,
    voucherCode: voucherCode || null,
    totalAmount,
    discountAmount: 0,
    shippingFee: 0,
    finalAmount: totalAmount,
    orderItems,
  };

  function updateItem(itemId: string, changes: Partial<OrderLineItem>) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, ...changes } : item,
      ),
    );
  }

  function addLineItem() {
    setItems((current) => [...current, defaultLineItem()]);
  }

  function removeLineItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!shippingName || !shippingPhone || !shippingAddress) {
      setError("Vui lòng nhập đầy đủ thông tin giao nhận.");
      return;
    }

    if (orderItems.length === 0) {
      setError("Đơn hàng phải có ít nhất một sản phẩm.");
      return;
    }

    setLoading(true);
    try {
      await createOrder(payload);
      setSuccess("Đơn hàng đã tạo thành công.");
      setItems([defaultLineItem()]);
      setVoucherCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader />
      <main className="main">
      <section className="card header">
        <h1>Tạo Đơn Hàng Mới</h1>
        <p>
          Khởi tạo đơn hàng mới theo kênh online/offline và kiểm tra tồn kho.
        </p>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ margin: 0, color: "#4b5563" }}>
              Điền thông tin khách hàng, chọn sản phẩm và tạo đơn hàng mới.
            </p>
          </div>
          <div className="buttons-group" style={{ justifyContent: "flex-start" }}>
            <button className="button" onClick={() => router.back()}>
              Quay lại
            </button>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}

        <form onSubmit={handleSubmit} className="login-form">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            <div style={{ padding: "20px", borderRadius: "14px", background: "#f8fafc" }}>
              <h3 className="section-title-center">Thông Tin Đơn</h3>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <span>Kênh bán</span>
                <select
                  value={orderChannel}
                  onChange={(e) => setOrderChannel(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {orderChannels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <span>Phương thức thanh toán</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "0" }}>
                <span>Đã thanh toán</span>
                <select
                  value={isPaid ? "yes" : "no"}
                  onChange={(e) => setIsPaid(e.target.value === "yes")}
                  style={{ width: "100%" }}
                >
                  <option value="no">Chưa</option>
                  <option value="yes">Đã thanh toán</option>
                </select>
              </label>
            </div>

            <div style={{ padding: "20px", borderRadius: "14px", background: "#f8fafc" }}>
              <h3 className="section-title-center">Thông Tin Khách Hàng</h3>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <span>Tên người nhận</span>
                <input
                  type="text"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <span>Số điện thoại</span>
                <input
                  type="text"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "0" }}>
                <span>Địa chỉ giao hàng</span>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  required
                  style={{ width: "100%", resize: "vertical" }}
                />
              </label>
            </div>
          </div>

          <div className="card" style={{ marginTop: "16px" }}>
            <h2 className="section-title-center">Chi Tiết Sản Phẩm</h2>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "12px",
                  alignItems: "end",
                  marginBottom: "16px",
                }}
              >
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Sản phẩm
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const productId = e.target.value;
                      const product = products.find((p) => p.id === productId);
                      updateItem(item.id, {
                        productId,
                        unitPrice: product?.price ?? 0,
                        quantity: 1,
                      });
                    }}
                    required
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.productCode} - {product.name} ({product.category ?? "Không rõ"}) (
                        {product.stockQuantity} tồn)
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Số lượng
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, {
                        quantity: Number(e.target.value),
                      })
                    }
                    required
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Giá bán
                  <input type="number" value={item.unitPrice} readOnly />
                </label>
              </div>
            ))}
            <div className="product-actions-row" style={{ marginTop: "16px" }}>
              <div>
                <button type="button" className="button" onClick={addLineItem}>
                  Thêm sản phẩm
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    // remove last item
                    setItems((current) =>
                      current.length <= 1 ? [defaultLineItem()] : current.slice(0, -1),
                    );
                  }}
                  style={{ marginLeft: "12px", background: "#ef4444" }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "16px" }}>
            <h2 className="section-title-center">Voucher</h2>
            <div className="input-group">
              <label>
                Mã voucher
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
              </label>
            </div>
          </div>

          <section className="card" style={{ marginTop: "16px" }}>
            <h2 className="section-title-center">Tóm Tắt Thông Tin Đơn Hàng</h2>
            <p>
              Tổng tiền hàng:{" "}
              {totalAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
            <p>Phí giao hàng: 0 ₫</p>
            <p>Giảm giá: 0 ₫</p>
            <p>
              Tổng phải trả:{" "}
              {totalAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </section>

          <div className="buttons-group" style={{ marginTop: "16px" }}>
            <button className="button login-button" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo đơn hàng"}
            </button>
          </div>
        </form>
      </section>
    </main>
    </>
  );
}
