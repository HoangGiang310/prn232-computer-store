import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

export default function AdminHeader() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ token: string; role: string; username: string } | null>(null);

  useEffect(() => {
    const currentAuth = getAuth();
    if (currentAuth) {
      setAuth(currentAuth);
    }
  }, []);

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  const currentPath = router.pathname;

  return (
    <header className="admin-shop-nav">
      <Link href="/" className="admin-shop-brand" aria-label="TQG Computer Store">
        <span className="admin-shop-logo">TQG</span>
        <span>
          <strong>CỬA HÀNG MÁY TÍNH</strong>
          <small>BẢNG ĐIỀU KHIỂN ADMIN</small>
        </span>
      </Link>

      <div className="admin-shop-nav-links">
        {currentPath !== "/admin" && (
          <Link href="/admin">
            BẢNG ĐIỀU KHIỂN
          </Link>
        )}
        <Link href="/products" className={currentPath === "/products" ? "active" : ""}>
          SẢN PHẨM
        </Link>
        <Link href="/orders" className={currentPath === "/orders" ? "active" : ""}>
          ĐƠN HÀNG
        </Link>
        <Link href="/inventory" className={currentPath === "/inventory" ? "active" : ""}>
          KHO HÀNG
        </Link>
        <Link href="/reports" className={currentPath === "/reports" ? "active" : ""}>
          BÁO CÁO
        </Link>
        <button type="button" className="admin-shop-logout" onClick={handleLogout}>
          ĐĂNG XUẤT
        </button>
      </div>
    </header>
  );
}
