import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["bookkeeper", "accountant"];

export default function BookkeeperPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !allowedRoles.includes(auth.role)) {
      router.replace("/login?redirect=bookkeeper");
      return;
    }

    setUsername(auth.username);
    setLoading(false);
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Bookkeeper Web</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Bảng điều khiển Kế toán</h1>
        <p>Xin chào, {username}. Giao diện dành cho vai trò kế toán và báo cáo tài chính.</p>
      </section>

      <section className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div style={{ padding: "18px", background: "#eff6ff", borderRadius: "14px" }}>
            <h3>Báo cáo tài chính</h3>
            <p>Xem doanh thu, lợi nhuận, doanh số online/offline và phân tích đơn hàng.</p>
          </div>
          <div style={{ padding: "18px", background: "#fef3c7", borderRadius: "14px" }}>
            <h3>Thu chi & hóa đơn</h3>
            <p>Theo dõi các công nợ, hoàn trả và số liệu chi phí.</p>
          </div>
          <div style={{ padding: "18px", background: "#ecfdf5", borderRadius: "14px" }}>
            <h3>Cảnh báo tài chính</h3>
            <p>Nhận báo cáo nhanh về lợi nhuận và các sản phẩm bán chạy.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <h2>Truy cập nhanh</h2>
        </div>

        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <Link href="/reports" className="button dashboard-button">
            Báo cáo & thống kê
          </Link>
          <Link href="/orders" className="button dashboard-button">
            Danh sách đơn hàng
          </Link>
          <Link href="/inventory" className="button dashboard-button">
            Báo cáo tồn kho
          </Link>
          <Link href="/customers" className="button dashboard-button">
            Khách hàng & giao dịch
          </Link>
        </div>
      </section>

      <section className="card" style={{ marginTop: "24px" }}>
        <h2>Chức năng kế toán</h2>
        <ul>
          <li>Xem báo cáo doanh thu, lợi nhuận và đơn hàng.</li>
          <li>Kiểm tra sản phẩm bán chạy và tình trạng kho liên quan.</li>
          <li>Quản lý đơn hàng, yêu cầu hoàn trả và thanh toán.</li>
          <li>Định hướng các con số thu chi cho bộ phận quản lý.</li>
        </ul>
      </section>

      <section className="card" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "24px" }}>
        <button className="button" style={{ minWidth: "180px" }} onClick={handleLogout}>
          Đăng xuất
        </button>
        <Link href="/" className="button back-button" style={{ minWidth: "180px" }}>
          Quay lại trang chủ
        </Link>
      </section>
    </main>
  );
}
