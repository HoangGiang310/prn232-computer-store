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

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!authToken) {
      setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    if (items.length === 0) {
      setError("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
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
        orderItems: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      await createOrder(payload, authToken);
      clearCheckoutCart();
      clearBuyNowCart(); // Xóa Buy Now cart sau khi thanh toán thành công
      setItems([]);
      setSuccess("Đặt hàng thành công. Vui lòng kiểm tra đơn hàng trong tài khoản của bạn.");
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

  if (items.length === 0) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Thanh toán</h1>
          <p>Giỏ hàng hiện đang trống.</p>
          <div className="buttons-group">
            <Link href="/customer" className="button">
              Quay lại cửa hàng
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1>Thanh toán</h1>
            <p>Xác nhận sản phẩm và nhập thông tin giao nhận.</p>
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
          {items.map((item) => (
            <div key={item.productId} className="cart-item-row">
              <div>
                <strong>{item.name}</strong>
                <p>Mã: {item.productCode || "-"}</p>
                <p>Giá: {Number(item.price).toLocaleString("vi-VN")} ₫</p>
              </div>
              <div>
                <p>Số lượng: {item.quantity}</p>
                <p>Tạm tính: {(item.price * item.quantity).toLocaleString("vi-VN")} ₫</p>
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
