import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="main">
      <section className="card header">
        <h1>Bảng điều khiển Shop</h1>
        <p>Truy cập nhanh các chức năng quản lý chính của hệ thống.</p>
      </section>

      <section className="card">
        <h2>Chức năng chính</h2>
        <ul>
          <li>Quản lý sản phẩm</li>
          <li>Quản lý đơn hàng</li>
          <li>Quản lý kho</li>
          <li>Tạo đơn hàng mới</li>
        </ul>
        <div className="buttons-group" style={{ flexWrap: "wrap" }}>
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
          <Link href="/" className="button">
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
