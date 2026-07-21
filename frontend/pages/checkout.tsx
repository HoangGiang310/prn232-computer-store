import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { createOrder } from "../lib/api";
import { getAuth } from "../lib/auth";
import { clearCheckoutCart, readCheckoutCart, readBuyNowCart, clearBuyNowCart, type CheckoutCartItem } from "../lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CheckoutCartItem[]>([]);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("E-Wallet");
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "customer") {
      router.replace("/login?redirect=customer");
      return;
    }

    // Ưu tiên đọc từ Buy Now cart (từ "Mua Ngay")
    const buyNowItems = readBuyNowCart();
    const savedItems = buyNowItems.length > 0 ? buyNowItems : readCheckoutCart();
    setItems(savedItems);
    setShippingName(auth.username || "");
    setAuthToken(auth.token);

    // Cleanup: xóa Buy Now cart khi người dùng quay lại trang này
    return () => {
      // Không xóa ngay, để cho người dùng hoàn thành đơn hàng trước
    };
  }, [router]);

  const selectedItems = useMemo(
    () => items.filter((item) => item.selected !== false),
    [items],
  );

  const totalAmount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!authToken) {
      setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    if (!shippingName || !shippingPhone || !shippingAddress) {
      setError("Vui lòng nhập đầy đủ thông tin giao nhận.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderChannel: "Online",
        orderStatus: "New",
        paymentMethod,
        isPaid: true,
        shippingName,
        shippingPhone,
        shippingAddress,
        voucherCode: voucherCode || null,
        totalAmount,
        discountAmount: 0,
        shippingFee: 0,
        finalAmount: totalAmount,
        orderItems: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      const orderData = await createOrder(payload, authToken);
      
      // Lưu thông tin đơn hàng vào sessionStorage (chỉ cho tab hiện tại)
      if (orderData && orderData.id) {
        sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
      }
      
      // Xóa cart
      clearCheckoutCart();
      clearBuyNowCart();
      
      // Chuyển hướng đến trang đặt hàng thành công
      router.push('/order-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoBack() {
    // Xóa Buy Now cart khi thoát khỏi checkout
    clearBuyNowCart();
    router.back();
  }

  if (selectedItems.length === 0) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Thanh toán</h1>
          <p>Bạn cần chọn sản phẩm trước khi thanh toán.</p>
          <div className="buttons-group">
            <button type="button" className="button" onClick={() => router.push("/cart")}> 
              Quay lại giỏ hàng
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header" style={{ textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div>
            <h1>Thanh toán</h1>
            <p style={{ margin: "4px 0 0 0" }}>Xác nhận sản phẩm và nhập thông tin giao nhận.</p>
          </div>
          <button className="button" onClick={handleGoBack}>
            ← Quay lại
          </button>
        </div>
      </section>

      <section className="card">
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}

        <div style={{ display: "grid", gap: 16 }}>
          {selectedItems.map((item) => (
            <div key={item.productId} className="cart-item-row">
              <div className="cart-item-content">
                <div className="cart-item-media">
                  {item.mainImage ? (
                    <img src={item.mainImage} alt={item.name} />
                  ) : (
                    <div className="cart-item-media-fallback">💻</div>
                  )}
                </div>
                <div>
                  <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{item.name}</strong>
                  <p style={{ margin: "2px 0", fontSize: "0.88rem", color: "#64748b" }}>
                    Mã: {item.productCode || "-"} | Phân loại: {item.category || "-"}
                  </p>
                  <p style={{ margin: "2px 0", fontWeight: 600, color: "#1d4ed8" }}>
                    Giá: {Number(item.price).toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "2px 0", color: "#64748b" }}>Số lượng: <strong>{item.quantity}</strong></p>
                <p style={{ margin: "2px 0", fontWeight: 700, color: "#0f172a" }}>
                  Tạm tính: {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, fontWeight: 700, fontSize: 18 }}>
          Tổng thanh toán: {totalAmount.toLocaleString("vi-VN")} ₫
        </div>
      </section>

      <section className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>
              Tên người nhận
              <input value={shippingName} onChange={(e) => setShippingName(e.target.value)} required />
            </label>
            <label>
              Số điện thoại
              <input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} required />
            </label>
            <label>
              Địa chỉ nhận hàng
              <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={3} required />
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
              <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
            </label>
          </div>

          <div className="buttons-group">
            <button type="submit" className="button login-button" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
