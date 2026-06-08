import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "admin") {
      router.replace("/login?redirect=admin");
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
          <h1>Admin Dashboard</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Admin Dashboard</h1>
        <p>
          Xin chào, {username}. Trang quản lý dành cho quản trị viên hệ thống.
        </p>
      </section>

      <section className="card">
        <h2>Chức năng chính</h2>
        <ul>
          <li>Quản lý sản phẩm</li>
          <li>Quản lý đơn hàng</li>
          <li>Quản lý kho</li>
          <li>Báo cáo và thống kê</li>
        </ul>
        <div className="buttons-group">
          <Link href="/products" className="button">
            Quản lý sản phẩm
          </Link>
          <Link href="/orders" className="button">
            Quản lý đơn hàng
          </Link>
          <Link href="/create-order" className="button">
            Tạo đơn hàng mới
          </Link>
          <Link href="/inventory" className="button">
            Quản lý kho
          </Link>
        </div>
        <div className="buttons-group" style={{ marginTop: "16px" }}>
          <button className="button" onClick={handleLogout}>
            Đăng xuất
          </button>
          <Link href="/" className="button">
            Quay lại trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
