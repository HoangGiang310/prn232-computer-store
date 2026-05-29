import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["manager"];

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
        <h1>Manager Web</h1>
        <p>Xin chào, {username}. Giao diện dành cho quản lý kho.</p>
      </section>

      <section className="card">
        <h2>Chức năng chính</h2>
        <ul>
          <li>Kiểm tra tồn kho chi tiết</li>
          <li>Quản lý nhập xuất kho</li>
          <li>Theo dõi tình trạng hàng hóa</li>
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
