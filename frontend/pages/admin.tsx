import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getAuth, getRedirectFromRole, logout } from "../lib/auth";

const adminActions = [
  {
    href: "/products",
    title: "QUẢN LÝ SẢN PHẨM",
    desc: "Thêm, sửa, xóa laptop và theo dõi danh mục hàng hóa.",
    stat: "SP",
  },
  {
    href: "/orders",
    title: "QUẢN LÝ ĐƠN HÀNG",
    desc: "Kiểm tra đơn online, offline và cập nhật trạng thái xử lý.",
    stat: "ĐH",
  },
  {
    href: "/create-order",
    title: "TẠO ĐƠN HÀNG MỚI",
    desc: "Tạo đơn bán trực tiếp tại cửa hàng cho nhân viên POS.",
    stat: "POS",
  },
  {
    href: "/inventory",
    title: "QUẢN LÝ KHO",
    desc: "Theo dõi tồn kho, điều chỉnh nhập xuất và cảnh báo thiếu hàng.",
    stat: "KHO",
  },
  {
    href: "/customers",
    title: "QUẢN LÝ KHÁCH HÀNG",
    desc: "Lưu thông tin khách, ghi chú và lịch sử mua hàng.",
    stat: "KH",
  },
  {
    href: "/vouchers",
    title: "QUẢN LÝ VOUCHER",
    desc: "Tạo mã giảm giá, thời hạn và điều kiện áp dụng.",
    stat: "%",
  },
  {
    href: "/users",
    title: "QUẢN LÝ NHÂN VIÊN",
    desc: "Tạo tài khoản, phân quyền và đặt lại mật khẩu.",
    stat: "NV",
  },
  {
    href: "/reports",
    title: "BÁO CÁO & THỐNG KÊ",
    desc: "Xem doanh thu, lợi nhuận, top sản phẩm và trạng thái kho.",
    stat: "BC",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState("ADMIN");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token) {
      router.replace("/login?redirect=admin");
      return;
    }

    if (auth.role?.toLowerCase() !== "admin") {
      router.replace(getRedirectFromRole(auth.role));
      return;
    }

    setUsername(auth.username || "ADMIN");
    setReady(true);
  }, [router]);

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  if (!ready) {
    return (
      <main className="admin-shop-page">
        <section className="admin-shop-loading">
          <h1>ĐANG KIỂM TRA PHIÊN ĐĂNG NHẬP</h1>
          <p>VUI LÒNG CHỜ TRONG GIÂY LÁT.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shop-page">
      <nav className="admin-shop-nav">
        <Link href="/" className="admin-shop-brand" aria-label="TQG Computer Store">
          <span className="admin-shop-logo">TQG</span>
          <span>
            <strong>CỬA HÀNG MÁY TÍNH</strong>
            <small>BẢNG ĐIỀU KHIỂN ADMIN</small>
          </span>
        </Link>

        <div className="admin-shop-nav-links">
          <Link href="/products">SẢN PHẨM</Link>
          <Link href="/orders">ĐƠN HÀNG</Link>
          <Link href="/inventory">KHO HÀNG</Link>
          <Link href="/reports">BÁO CÁO</Link>
        </div>

        <button className="admin-shop-logout" onClick={handleLogout}>
          ĐĂNG XUẤT
        </button>
      </nav>

      <section className="admin-shop-hero">
        <div className="admin-shop-hero-copy">
          <p>BẢNG ĐIỀU KHIỂN SHOP</p>
          <h1>QUẢN TRỊ TOÀN BỘ HỆ THỐNG BÁN HÀNG</h1>
          <span>
            XIN CHÀO <strong>{username.toUpperCase()}</strong>. THEO DÕI SẢN PHẨM, ĐƠN HÀNG, KHO, NHÂN VIÊN VÀ BÁO CÁO TRONG MỘT MÀN HÌNH.
          </span>
        </div>

        <div className="admin-shop-terminal" aria-hidden="true">
          <div className="terminal-top">
            <span />
            <span />
            <span />
          </div>
          <div className="terminal-screen">
            <strong>ADMIN MODE</strong>
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <div className="admin-shop-layout">
        <section className="admin-shop-main">
          <div className="admin-shop-tabs">
            <span className="active">CHỨC NĂNG CHÍNH</span>
            <span>VẬN HÀNH</span>
            <span>BÁO CÁO</span>
          </div>

          <div className="admin-shop-grid">
            {adminActions.map((action) => (
              <Link href={action.href} className="admin-shop-action" key={action.href}>
                <span className="action-mark">{action.stat}</span>
                <strong>{action.title}</strong>
                <small>{action.desc.toUpperCase()}</small>
              </Link>
            ))}
          </div>
        </section>

        <aside className="admin-shop-side">
          <section className="admin-shop-panel">
            <h2>TRẠNG THÁI HỆ THỐNG</h2>
            <div className="admin-shop-status">
              <span>PHIÊN ĐĂNG NHẬP</span>
              <strong>ĐANG HOẠT ĐỘNG</strong>
            </div>
            <div className="admin-shop-status">
              <span>VAI TRÒ</span>
              <strong>ADMIN</strong>
            </div>
            <div className="admin-shop-status">
              <span>KHU VỰC</span>
              <strong>SHOP TQG</strong>
            </div>
          </section>

          <section className="admin-shop-panel">
            <h2>ĐIỀU HƯỚNG NHANH</h2>
            <div className="admin-shop-quick">
              <Link href="/">TRANG CHỦ</Link>
              <Link href="/users">NHÂN VIÊN</Link>
              <Link href="/vouchers">VOUCHER</Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
