import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth } from "../lib/auth";

type OrderData = {
  id: string;
  orderChannel: string;
  orderStatus: string;
  paymentMethod: string;
  isPaid: boolean;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  voucherCode?: string | null;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  createdAt: string;
  orderItems?: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    product?: {
      name?: string;
      images?: Array<{ id: string; imageUrl: string; isMain?: boolean }>;
    };
  }>;
};

export default function OrderSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "customer") {
      router.replace("/login?redirect=customer");
      return;
    }

    // Chỉ access sessionStorage ở client-side
    if (typeof window === 'undefined') return;

    // Hàm để lấy order data từ sessionStorage
    const tryLoadOrderData = () => {
      const lastOrderJson = sessionStorage.getItem("lastOrder");
      
      if (lastOrderJson) {
        try {
          const orderData = JSON.parse(lastOrderJson);
          setOrder(orderData);
          sessionStorage.removeItem("lastOrder");
          setLoading(false);
        } catch (err) {
          console.error("Lỗi parse order data:", err);
          setLoading(false);
        }
      } else {
        setLoading(false);
        // Nếu không có data sau khi load, quay về trang chủ
        router.push("/");
      }
    };

    // Đợi một chút để chắc chắn sessionStorage được cập nhật
    const timer = setTimeout(tryLoadOrderData, 200);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Đang tải...</h1>
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Không tìm thấy thông tin đơn hàng</h1>
          <Link href="/">
            <button className="button">Quay về trang chủ</button>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header" style={{ backgroundColor: "white", borderLeft: "4px solid #4caf50" }}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <h1 style={{ color: "#2e7d32", marginBottom: "5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <span style={{ fontSize: "56px", color: "#2e7d32" }}>✓</span>
            ĐẶT HÀNG THÀNH CÔNG
          </h1>
          <p style={{ color: "#558b2f" }}>Cảm ơn bạn đã mua sắm tại cửa hàng TQG Computer</p>
        </div>
      </section>

      <section className="card">
        <h2>Thông tin đơn hàng</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
            <span style={{ fontWeight: 600 }}>Mã đơn hàng:</span>
            <span style={{ fontWeight: 700, color: "#d32f2f" }}>{order.id}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
            <span style={{ fontWeight: 600 }}>Ngày đặt:</span>
            <span>{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
            <span style={{ fontWeight: 600 }}>Trạng thái:</span>
            <span style={{ backgroundColor: "#fff3e0", padding: "4px 8px", borderRadius: "4px", color: "#e65100", fontWeight: 600 }}>
              {order.orderStatus === "New" ? "Mới" : order.orderStatus}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
            <span style={{ fontWeight: 600 }}>Kênh đặt hàng:</span>
            <span>{order.orderChannel}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Thông tin giao nhận</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Người nhận:</span>
            <span>{order.shippingName}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Số điện thoại:</span>
            <span>{order.shippingPhone}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Địa chỉ giao nhận:</span>
            <span style={{ whiteSpace: "pre-wrap" }}>{order.shippingAddress}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Phương thức thanh toán:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Tình trạng thanh toán:</span>
            <span style={{ color: order.isPaid ? "#2e7d32" : "#d32f2f" }}>
              {order.isPaid ? "✓ Đã thanh toán" : "Chưa thanh toán"}
            </span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Chi tiết sản phẩm</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {order.orderItems && order.orderItems.length > 0 ? (
            order.orderItems.map((item, index) => {
              const mainImage =
                item.product?.images?.find((img: any) => img.isMain)?.imageUrl ||
                item.product?.images?.[0]?.imageUrl;
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="cart-item-media" style={{ width: 44, height: 44, minWidth: 44, borderRadius: 8, overflow: 'hidden' }}>
                      {mainImage ? (
                        <img src={mainImage} alt={item.product?.name || item.productName || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="cart-item-media-fallback" style={{ fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f1f5f9' }}>💻</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {item.product?.name || item.productName || `Sản phẩm ${item.productId}`}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Mã sản phẩm: {item.productId}</div>
                      <div style={{ color: "#64748b", fontSize: "12px" }}>Số lượng: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{item.unitPrice.toLocaleString("vi-VN")} ₫</div>
                    <div style={{ fontWeight: 700, color: "#1d4ed8" }}>
                      {(item.quantity * item.unitPrice).toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "12px", textAlign: "center", color: "#999" }}>Không có sản phẩm</div>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Tóm tắt thanh toán</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
            <span>Tổng tiền hàng:</span>
            <span>{order.totalAmount.toLocaleString("vi-VN")} ₫</span>
          </div>
          {order.discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px", color: "#2e7d32" }}>
              <span>Giảm giá:</span>
              <span>-{order.discountAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}
          {order.shippingFee > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
              <span>Phí vận chuyển:</span>
              <span>{order.shippingFee.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#d32f2f", paddingTop: "8px" }}>
            <span>Tổng cộng:</span>
            <span>{order.finalAmount.toLocaleString("vi-VN")} ₫</span>
          </div>
        </div>
      </section>

      <section className="card">
        <div style={{ textAlign: "center", display: "grid", gap: "12px" }}>
          <p style={{ color: "#666" }}>Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.</p>
          <p style={{ color: "#666" }}>Bạn có thể theo dõi trạng thái đơn hàng trong phần Lịch Sử Đơn Hàng.</p>
          <div className="buttons-group">
            <Link href="/">
              <button className="button" style={{ width: "100%", padding: "12px" }}>
                ← Quay về trang chủ
              </button>
            </Link>
            <Link href="/order-history">
              <button className="button" style={{ width: "100%", padding: "12px" }}>
                Xem Lịch Sử Đơn Hàng
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
