import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["staff", "sales"];

export default function StaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !allowedRoles.includes(auth.role)) {
      router.replace("/login?redirect=staff");
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
          <h1>Staff Web</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Staff Web</h1>
        <p>
          Xin chào, {username}. Giao diện dành cho nhân viên bán hàng và quản lý
          kho.
        </p>
      </section>

      <section className="card">
        <h2>Chức năng chính</h2>
        <ul>
          <li>Bán hàng trực tiếp tại cửa hàng</li>
          <li>Kiểm tra tồn kho</li>
          <li>Quản lý đơn hàng offline</li>
        </ul>
        <div className="buttons-group">
          <Link href="/create-order" className="button">
            Tạo đơn hàng mới
          </Link>
          <Link href="/orders" className="button">
            Danh sách đơn hàng
          </Link>
          <Link href="/inventory" className="button">
            Quản lý kho
          </Link>
          <Link href="/customers" className="button">
            Quản lý khách hàng
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
