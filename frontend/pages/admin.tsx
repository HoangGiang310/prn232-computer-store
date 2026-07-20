import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminHeader from "../components/AdminHeader";
import { getAuth, getRedirectFromRole, logout } from "../lib/auth";

const adminActionGroups = [
  {
    title: "BÁN HÀNG & VẬN HÀNH",
    items: [
      {
        href: "/create-order",
        title: "POS BÁN HÀNG",
        desc: "Tạo đơn trực tiếp tại cửa hàng, xử lý thanh toán và kiểm tra tồn kho tức thì.",
        stat: "POS",
      },
      {
        href: "/orders",
        title: "ĐƠN HÀNG",
        desc: "Theo dõi trạng thái đơn online, offline, hoàn hàng và giao nhận trong một bảng điều khiển.",
        stat: "ĐH",
      },
    ],
  },
  {
    title: "SẢN PHẨM & KHO",
    items: [
      {
        href: "/products",
        title: "QUẢN LÝ SẢN PHẨM",
        desc: "Thêm, chỉnh sửa và quản lý laptop, hình ảnh, giá bán và cấu hình.",
        stat: "SP",
      },
      {
        href: "/inventory",
        title: "QUẢN LÝ KHO",
        desc: "Theo dõi hàng tồn, nhập xuất, cảnh báo thiếu hàng và lịch sử điều chỉnh.",
        stat: "KHO",
      },
    ],
  },
  {
    title: "KHÁCH HÀNG & CHIẾN DỊCH",
    items: [
      {
        href: "/customers",
        title: "KHÁCH HÀNG",
        desc: "Quản lý thông tin khách hàng, ghi chú nội bộ và lịch sử mua hàng.",
        stat: "KH",
      },
      {
        href: "/vouchers",
        title: "VOUCHER & KHUYẾN MÃI",
        desc: "Tạo chương trình ưu đãi, điều kiện áp dụng và mã giảm giá cho cả online lẫn offline.",
        stat: "%",
      },
    ],
  },
  {
    title: "QUẢN TRỊ & BÁO CÁO",
    items: [
      {
        href: "/users",
        title: "NHÂN VIÊN",
        desc: "Thêm tài khoản, phân quyền theo vai trò và giám sát hoạt động của nhân sự.",
        stat: "NV",
      },
      {
        href: "/reports",
        title: "BÁO CÁO",
        desc: "Xem doanh thu, lợi nhuận, báo cáo kho và phân tích hiệu suất bán hàng.",
        stat: "BC",
      },
      {
        href: "/reviews",
        title: "ĐÁNH GIÁ",
        desc: "Duyệt bình luận, ẩn nội dung không phù hợp và giữ chất lượng trải nghiệm khách hàng.",
        stat: "★",
      },
    ],
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
    <main className="dashboard-page dashboard-admin-page">
      <AdminHeader />

      <section className="dashboard-hero admin-shop-hero">
        <div className="dashboard-hero-copy admin-shop-hero-copy">
          <p>BẢNG ĐIỀU KHIỂN SHOP</p>
          <h1>QUẢN TRỊ TOÀN BỘ HỆ THỐNG BÁN HÀNG</h1>
          <span>
            XIN CHÀO <strong>{username.toUpperCase()}</strong>. THEO DÕI SẢN PHẨM, ĐƠN HÀNG, KHO, NHÂN VIÊN VÀ BÁO CÁO TRONG MỘT MÀN HÌNH.
          </span>
          <div className="role-pill">Vai trò: Quản trị toàn diện</div>
        </div>

        <div className="dashboard-hero-visual admin-shop-terminal" aria-hidden="true">
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

      <div className="dashboard-grid admin-shop-layout">
        <section className="dashboard-main admin-shop-main">
          <div className="admin-shop-tabs">
            <span className="active">CHỨC NĂNG CHÍNH</span>
            <span>VẬN HÀNH</span>
            <span>BÁO CÁO</span>
          </div>

          <div className="role-shell">
            <section className="dashboard-card card role-hero role-hero-admin">
              <div className="role-stat-grid">
                <div className="role-stat-card">
                  <strong>24/7</strong>
                  <span>Giám sát vận hành</span>
                </div>
                <div className="role-stat-card">
                  <strong>4 vai trò</strong>
                  <span>Phân quyền rõ ràng</span>
                </div>
                <div className="role-stat-card">
                  <strong>100%</strong>
                  <span>Thông tin tập trung</span>
                </div>
              </div>
            </section>

            {adminActionGroups.map((group) => (
              <section className="dashboard-card card role-group-card" key={group.title}>
                <h3>{group.title}</h3>
                <div className="admin-shop-grid">
                  {group.items.map((action) => (
                    <Link href={action.href} className="admin-shop-action" key={action.href}>
                      <span className="action-mark">{action.stat}</span>
                      <strong>{action.title}</strong>
                      <small>{action.desc.toUpperCase()}</small>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="dashboard-sidebar admin-shop-side">
          <section className="dashboard-card admin-shop-panel">
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

          <section className="dashboard-card admin-shop-panel">
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
