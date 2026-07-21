import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CustomerHeader from "../components/CustomerHeader";
import { getAuth } from "../lib/auth";
import { clearCheckoutCart, readCheckoutCart, type CheckoutCartItem } from "../lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ token: string; role: string; username: string } | null>(null);
  const [items, setItems] = useState<CheckoutCartItem[]>([]);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    const currentAuth = getAuth();
    if (!currentAuth || currentAuth.role?.toLowerCase() !== "customer") {
      router.replace("/login?redirect=customer");
      return;
    }

    setAuth(currentAuth);
    setItems(readCheckoutCart());
  }, [router]);

  const selectedItems = useMemo(
    () => items.filter((item) => item.selected !== false),
    [items],
  );

  const totalAmount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  function persistItems(nextItems: CheckoutCartItem[]) {
    setItems(nextItems);
    if (typeof window !== "undefined") {
      const storageKey = "computer-store-checkout-cart";
      window.localStorage.setItem(storageKey, JSON.stringify(nextItems));
    }
  }

  function handleQuantityChange(productId: string, delta: number) {
    const nextItems = items
      .map((item) => {
        if (item.productId !== productId) return item;
        const nextQuantity = item.quantity + delta;
        return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
      })
      .filter((item): item is CheckoutCartItem => item !== null);

    persistItems(nextItems);
  }

  function handleToggleSelect(productId: string) {
    persistItems(
      items.map((item) =>
        item.productId === productId ? { ...item, selected: !item.selected } : item,
      ),
    );
  }

  function handleRemove(productId: string) {
    persistItems(items.filter((item) => item.productId !== productId));
  }

  function handleClear() {
    clearCheckoutCart();
    setItems([]);
  }

  function handleProceedToCheckout() {
    if (selectedItems.length === 0) {
      setCartError("Bạn cần chọn sản phẩm trước khi thanh toán");
      return;
    }
    setCartError("");
    router.push("/checkout");
  }

  if (!auth) {
    return null;
  }

  return (
    <>
      <CustomerHeader />
      <main className="main">
        <section className="card header" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div>
              <h1>Giỏ Hàng Của Bạn</h1>
              <p style={{ margin: "4px 0 0 0" }}>Xem lại các sản phẩm bạn đã thêm vào giỏ.</p>
            </div>
            <div className="buttons-group" style={{ justifyContent: "center" }}>
              <Link href="/" className="button">
                ← Quay Về Trang Chủ
              </Link>
            </div>
          </div>
        </section>

      <section className="card">
        {cartError ? <p className="error">{cartError}</p> : null}
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
                  <div className="cart-item-content">
                    <input
                      type="checkbox"
                      checked={item.selected !== false}
                      onChange={() => handleToggleSelect(item.productId)}
                    />
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
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button className="button" onClick={() => handleQuantityChange(item.productId, -1)} aria-label={`Giảm số lượng ${item.name}`}>
                        −
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{item.quantity}</span>
                      <button className="button" onClick={() => handleQuantityChange(item.productId, 1)} aria-label={`Tăng số lượng ${item.name}`}>
                        +
                      </button>
                    </div>
                    <span style={{ fontWeight: 700, minWidth: 90, textAlign: "right", color: "#0f172a" }}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </span>
                    <button className="button" onClick={() => handleRemove(item.productId)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid rgba(15, 23, 42, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#0f172a" }}>
                Tổng tiền: {totalAmount.toLocaleString("vi-VN")} ₫
              </div>
              <button
                type="button"
                className="button login-button"
                onClick={handleProceedToCheckout}
                style={{
                  padding: "12px 32px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  borderRadius: "999px",
                  background: "#4338ca",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(67, 56, 202, 0.18)",
                  cursor: "pointer",
                }}
              >
                Thanh toán
              </button>
            </div>
          </>
        )}
      </section>
    </main>
    </>
  );
}
