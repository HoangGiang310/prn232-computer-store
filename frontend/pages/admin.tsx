import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getAuth, getRedirectFromRole, logout } from "../lib/auth";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token) {
      router.replace("/login?redirect=admin");
      return;
    }

    if (auth.role?.toLowerCase() !== "admin") {
      router.replace(getRedirectFromRole(auth.role));
    }
  }, [router]);
  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Bảng Điều Khiển Shop</h1>
      </section>

      <section className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          <Link href="/products" className="button">
            Quản Lý Sản Phẩm
          </Link>
          <Link href="/orders" className="button">
            Quản Lý Đơn Hàng
          </Link>
          <Link href="/create-order" className="button">
            Tạo Đơn Hàng Mới
          </Link>
          <Link href="/inventory" className="button">
            Quản Lý Kho
          </Link>
          <Link href="/customers" className="button">
            Quản Lý Khách Hàng
          </Link>
          <Link href="/vouchers" className="button">
            Quản Lý Voucher
          </Link>
          <Link href="/users" className="button">
            Quản Lý Nhân Viên
          </Link>
          <Link href="/reports" className="button">
            Báo Cáo & Thống Kê
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
          <Link href="/" className="button" style={{ minWidth: "220px" }}>
            Trở Về Trang Chủ
          </Link>
          <button className="button" style={{ minWidth: "220px" }} onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </section>
    </main>
  );
}
