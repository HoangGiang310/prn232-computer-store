import Link from "next/link";

export default function Home() {
  return (
    <main className="main">
      <section className="card header">
        <h1>Computer Store</h1>
        <p>Chọn quyền truy cập để xem giao diện quản lý hoặc đặt hàng.</p>
      </section>

      <section className="card">
        <h2>Ứng dụng</h2>
        <ul>
          <li>
            <Link href="/login?redirect=admin" className="button">
              Đăng nhập Admin
            </Link>
          </li>
          <li>
            <Link href="/login?redirect=staff" className="button">
              Đăng nhập Staff
            </Link>
          </li>
          <li>
            <Link href="/login?redirect=customer" className="button">
              Đăng nhập Customer
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
