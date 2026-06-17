import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["manager", "warehouse"];

export default function ManagerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !allowedRoles.includes(auth.role)) {
      router.replace("/login?redirect=manager");
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
          <h1>Manager Web</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản lý kho</h1>
        <p>Chào mừng, {username}. Đây là khu vực quản lý kho dành cho bạn.</p>
      </section>

      <section className="card dashboard-card">
        <div className="dashboard-section">
          <h2>Chức năng chính</h2>
          <p>Điều hướng nhanh đến các công việc quản lý kho và theo dõi tồn kho.</p>
        </div>

        <div className="dashboard-grid">
          <Link href="/inventory" className="button dashboard-button">
            Quản lý tồn kho
          </Link>
          <Link href="/products" className="button dashboard-button">
            Danh sách sản phẩm
          </Link>
          <Link href="/orders" className="button dashboard-button">
            Theo dõi đơn hàng
          </Link>
          <Link href="/reports" className="button dashboard-button">
            Báo cáo tồn kho
          </Link>
        </div>
      </section>

      <section className="card dashboard-card">
        <h2>Lưu ý vai trò</h2>
        <ul>
          <li>Xem và điều chỉnh tồn kho</li>
          <li>Kiểm tra lịch sử điều chỉnh kho</li>
          <li>Giám sát tình trạng hàng hóa và cảnh báo tồn kho thấp</li>
        </ul>
      </section>

      <section className="card button-row">
        <button className="button" onClick={handleLogout}>
          Đăng xuất
        </button>
        <Link href="/" className="button back-button">
          Quay lại trang chủ
        </Link>
      </section>
    </main>
  );
}
