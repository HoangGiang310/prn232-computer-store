import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

export default function CustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "customer") {
      router.replace("/login?redirect=customer");
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
          <h1>Customer Web</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Customer Web</h1>
        <p>Xin chào, {username}. Giao diện đặt hàng online cho khách hàng.</p>
      </section>

      <section className="card">
        <h2>Chức năng chính</h2>
        <ul>
          <li>Xem sản phẩm và giỏ hàng</li>
          <li>Đặt hàng online</li>
          <li>Theo dõi trạng thái đơn hàng</li>
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
