import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["bookkeeper"];

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
        <h1>Bookkeeper Web</h1>
        <p>Xin chào, {username}. Giao diện dành cho kế toán cửa hàng.</p>
      </section>

      <section className="card">
        <h2>Chức năng chính</h2>
        <ul>
          <li>Quản lý báo cáo tài chính</li>
          <li>Kiểm tra doanh thu và chi phí</li>
          <li>Quản lý hóa đơn và thu chi</li>
        </ul>
        <button className="button" onClick={handleLogout}>
          Đăng xuất
        </button>
        <Link href="/" className="button">
          Quay lại trang chủ
        </Link>
      </section>
    </main>
  );
}
