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
        <div style={{ display: "flex", gap: "40px" }}>
          <ul>
            <li>Quản lý sản phẩm</li>
            <li>Quản lý đơn hàng</li>
            <li>Quản lý kho</li>
            <li>Tạo đơn hàng mới</li>
          </ul>
          <ul>
            <li>Quản lý khách hàng</li>
            <li>Quản lý voucher khuyến mãi</li>
            <li>Quản lý tài khoản nhân viên</li>
            <li>Xem báo cáo tài chính & doanh số</li>
          </ul>
        </div>
        <div className="buttons-group" style={{ flexWrap: "wrap", marginTop: "16px" }}>
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
          <Link href="/customers" className="button">
            Quản lý khách hàng
          </Link>
          <Link href="/vouchers" className="button">
            Quản lý voucher
          </Link>
          <Link href="/users" className="button">
            Quản lý nhân viên
          </Link>
          <Link href="/reports" className="button">
            Báo cáo & Thống kê
          </Link>
          <Link href="/" className="button">
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
