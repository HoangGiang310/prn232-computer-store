import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAuth } from "../lib/auth";
import { clearCheckoutCart, readCheckoutCart, type CheckoutCartItem } from "../lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ token: string; role: string; username: string } | null>(null);
  const [items, setItems] = useState<CheckoutCartItem[]>([]);

  useEffect(() => {
    const currentAuth = getAuth();
    if (!currentAuth || currentAuth.role?.toLowerCase() !== "customer") {
      router.replace("/login?redirect=customer");
      return;
    }

    setAuth(currentAuth);
    setItems(readCheckoutCart());
  }, [router]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  function handleRemove(productId: string) {
    const nextItems = items.filter((item) => item.productId !== productId);
    setItems(nextItems);
    if (typeof window !== "undefined") {
      const storageKey = "computer-store-checkout-cart";
      window.localStorage.setItem(storageKey, JSON.stringify(nextItems));
    }
  }

  function handleClear() {
    clearCheckoutCart();
    setItems([]);
  }

  if (!auth) {
    return null;
  }

  return (
    <main className="main">
      <section className="card header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1>Giỏ hàng của bạn</h1>
            <p>Xem lại các sản phẩm bạn đã thêm vào giỏ.</p>
          </div>
          <div className="buttons-group">
            <Link href="/" className="button">
              ← Quay Về Trang Chủ
            </Link>
            <Link href="/checkout" className="button login-button">
              Thanh toán
            </Link>
          </div>
        </div>
      </section>

      <section className="card">
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Sản phẩm đã chọn</h2>
              <button className="button" onClick={handleClear}>
                Xóa toàn bộ
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {items.map((item) => (
                <div key={item.productId} className="cart-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <p>Mã: {item.productCode || "-"}</p>
                    <p>Giá: {Number(item.price).toLocaleString("vi-VN")} ₫</p>
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 600 }}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </span>
                    <button className="button" onClick={() => handleRemove(item.productId)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, fontWeight: 700, fontSize: 18 }}>
              Tổng tiền: {totalAmount.toLocaleString("vi-VN")} ₫
            </div>
          </>
        )}
      </section>
    </main>
  );
}
