import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuth, getRedirectFromRole, logout } from "../lib/auth";
import { fetchProducts } from "../lib/api";

const featuredProducts = [
  {
    name: "LAPTOP GAMING RTX",
    price: "24.990.000Đ",
    tag: "BÁN CHẠY",
    spec: "INTEL I7, RTX 4060, 16GB RAM",
  },
  {
    name: "PC ĐỒ HỌA CREATOR",
    price: "31.500.000Đ",
    tag: "MỚI",
    spec: "RYZEN 7, RTX 4070, SSD 1TB",
  },
  {
    name: "MÀN HÌNH 27 INCH",
    price: "4.790.000Đ",
    tag: "GIẢM 12%",
    spec: "2K, 165HZ, IPS",
  },
];

const roleLabels: Record<string, string> = {
  admin: "ADMIN",
  manager: "QUẢN LÝ KHO",
  warehouse: "QUẢN LÝ KHO",
  staff: "NHÂN VIÊN",
  sales: "NHÂN VIÊN BÁN HÀNG",
  bookkeeper: "KẾ TOÁN",
  accountant: "KẾ TOÁN",
  customer: "KHÁCH HÀNG",
};

const quickLinks = [
  { target: "/products", loginRole: "manager", roles: ["manager", "warehouse", "admin"], label: "SẢN PHẨM" },
  { target: "/create-order", loginRole: "staff", roles: ["staff", "sales", "admin"], label: "TẠO ĐƠN" },
  { target: "/orders", loginRole: "staff", roles: ["staff", "sales", "admin"], label: "ĐƠN HÀNG" },
  { target: "/inventory", loginRole: "manager", roles: ["manager", "warehouse", "admin"], label: "KHO HÀNG" },
];

const homeProtectedLinks = {
  products: { target: "/products", loginRole: "manager", roles: ["manager", "warehouse", "admin"] },
  orders: { target: "/orders", loginRole: "staff", roles: ["staff", "sales", "admin"] },
  reports: { target: "/reports", loginRole: "bookkeeper", roles: ["bookkeeper", "accountant", "admin"] },
  inventory: { target: "/inventory", loginRole: "manager", roles: ["manager", "warehouse", "admin"] },
  customers: { target: "/customers", loginRole: "staff", roles: ["staff", "sales", "admin"] },
  vouchers: { target: "/vouchers", loginRole: "admin", roles: ["admin"] },
  staff: { target: "/staff", loginRole: "staff", roles: ["staff", "sales"] },
};

export default function Home() {
  const [auth, setAuth] = useState<{ token: string; role: string; username: string } | null>(null);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);

  useEffect(() => {
    setAuth(getAuth());
    fetchProducts()
      .then((data) => setLiveProducts(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setLiveProducts([]));
  }, []);

  function handleLogout() {
    logout();
    setAuth(null);
  }

  function protectedHref(config: { target: string; loginRole: string; roles: string[] }) {
    const currentRole = auth?.role?.toLowerCase();
    if (auth?.token && currentRole && config.roles.includes(currentRole)) {
      return config.target;
    }

    return `/login?redirect=${config.loginRole}`;
  }

  function getRoleLabel(role: string) {
    return roleLabels[role?.toLowerCase()] ?? role.toUpperCase();
  }

  return (
    <main className="store-home">
      <nav className="store-nav">
        <Link href="/" className="store-logo" aria-label="TQG Computer Store">
          <span className="store-logo-chip">TQG</span>
          <span>
            <strong>CỬA HÀNG MÁY TÍNH</strong>
            <small>LAPTOP - PC - LINH KIỆN</small>
          </span>
        </Link>

        <div className="store-nav-links">
          <Link href="/">TRANG CHỦ</Link>
          <Link href={protectedHref(homeProtectedLinks.products)}>SẢN PHẨM</Link>
          <Link href={protectedHref(homeProtectedLinks.orders)}>ĐƠN HÀNG</Link>
          <Link href={protectedHref(homeProtectedLinks.reports)}>BÁO CÁO</Link>
        </div>

        <div className="store-nav-actions">
          {auth ? (
            <button className="store-nav-button" onClick={handleLogout}>
              ĐĂNG XUẤT
            </button>
          ) : (
            <Link href="/login" className="store-nav-button">
              ĐĂNG NHẬP
            </Link>
          )}
          <Link href="/register" className="store-nav-link-secondary">
            ĐĂNG KÝ
          </Link>
        </div>
      </nav>

      <section className="store-hero" aria-label="KHUYẾN MÃI MÁY TÍNH">
        <div className="hero-copy">
          <span className="hero-eyebrow">ƯU ĐÃI LAPTOP & GAMING SIÊU HOT</span>
          <h1>Giao diện showroom laptop chuyên nghiệp cho Admin, nhân viên và khách hàng</h1>
          <p>
            TQG Computer Store cung cấp trải nghiệm mua sắm nhanh, danh mục sản phẩm rõ ràng và điều hướng role phù hợp cho mỗi người dùng.
          </p>

          <div className="hero-badges">
            <div className="hero-badge-card">
              <strong>Giao hàng nhanh</strong>
              <span>Trong 24h nội thành</span>
            </div>
            <div className="hero-badge-card">
              <strong>Đổi trả 30 ngày</strong>
              <span>Đảm bảo yên tâm khi mua</span>
            </div>
            <div className="hero-badge-card">
              <strong>Bảo hành toàn diện</strong>
              <span>Ưu đãi dịch vụ trọn gói</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link href={protectedHref(homeProtectedLinks.products)} className="hero-primary">
              XEM SẢN PHẨM
            </Link>
            <Link href="/register" className="hero-secondary">
              ĐĂNG KÝ KHÁCH HÀNG
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-card">
            <span className="product-label">Laptop Gaming</span>
            <strong>Giảm giá đến 30%</strong>
            <p>Intel i7, RTX 4060, RAM 16GB, màn hình 144Hz cho trải nghiệm mượt mà.</p>
          </div>
          <div className="hero-visual-glow" />
          <div className="hero-visual-image" aria-hidden="true">
            <span />
          </div>
        </div>
      </section>

      <section className="store-tabs" aria-label="ĐIỀU HƯỚNG NHANH">
        <Link href={protectedHref(homeProtectedLinks.products)} className="active">
          SẢN PHẨM
        </Link>
        <Link href={protectedHref(homeProtectedLinks.inventory)}>KHO HÀNG</Link>
        <Link href={protectedHref(homeProtectedLinks.customers)}>KHÁCH HÀNG</Link>
        <Link href={protectedHref(homeProtectedLinks.vouchers)}>VOUCHER</Link>
      </section>

      <div className="store-layout">
        <section className="store-feed">
          <div className="feed-heading">
            <div>
              <p>ƯU ĐÃI NỔI BẬT</p>
              <h2>Danh mục sản phẩm showroom</h2>
            </div>
            <Link href={protectedHref(homeProtectedLinks.products)} className="store-link">
              Xem toàn bộ danh mục
            </Link>
          </div>

          <div className="store-feature-row">
            <article className="feature-card">
              <strong>Máy mới</strong>
              <p>Laptop chính hãng, cấu hình mới nhất, trưng bày trực quan.</p>
            </article>
            <article className="feature-card">
              <strong>Ưu đãi</strong>
              <p>Giảm giá theo ngày, voucher, quà tặng đi kèm.</p>
            </article>
            <article className="feature-card">
              <strong>Top bán chạy</strong>
              <p>Sản phẩm được khách hàng đánh giá cao và mua nhiều nhất.</p>
            </article>
          </div>

          <div className="home-product-grid">
            {(liveProducts.length > 0 ? liveProducts : featuredProducts).map((product) => {
              const img =
                product.images?.find((i: any) => i.isMain)?.imageUrl ||
                product.images?.[0]?.imageUrl;

              const href = liveProducts.length > 0 && product.id ? `/product/${product.id}` : "/products";
              const priceText = typeof product.price === "number"
                ? `${product.price.toLocaleString("vi-VN")} ₫`
                : product.price;

              return (
                <Link href={href} className="home-product-card" key={(product as any).id ?? product.name}>
                  <div className="home-product-media">
                    {img ? <img src={img} alt={product.name} loading="lazy" /> : <span>💻</span>}
                    {product.brand ? <span className="home-product-brand">{product.brand}</span> : null}
                  </div>
                  <div className="home-product-info">
                    <h3>{product.name}</h3>
                    <p>{(product as any).specifications ?? product.spec}</p>
                    <strong>{priceText}</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <aside className="store-sidebar">
          <section className="side-panel side-panel-highlight">
            <h2>ƯU ĐÃI NGAY</h2>
            <p>Giao hàng nhanh, hỗ trợ trả góp và dịch vụ khách hàng 24/7 cho toàn bộ hệ thống.</p>
            <div className="promo-badges">
              <span>Miễn phí vận chuyển</span>
              <span>Trả góp 0%</span>
              <span>Hotline 24/7</span>
            </div>
          </section>

          <section className="side-panel">
            <h2>ĐĂNG NHẬP HỆ THỐNG</h2>
            {auth ? (
              <>
                <p>
                  XIN CHÀO <strong>{auth.username.toUpperCase()}</strong>
                </p>
                <p>
                  Bạn đang ở vai trò <strong>{getRoleLabel(auth.role)}</strong>.
                </p>
                <Link href={getRedirectFromRole(auth.role)} className="side-primary">
                  VÀO BẢNG ĐIỀU KHIỂN
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="side-primary">
                  ĐĂNG NHẬP
                </Link>
                <div className="side-actions">
                  <Link href="/register">ĐĂNG KÝ</Link>
                  <Link href="/login">QUÊN MẬT KHẨU</Link>
                </div>
              </>
            )}
          </section>

          <section className="side-panel">
            <h2>TRUY CẬP NHANH</h2>
            <div className="quick-grid">
              {quickLinks.map((item) => (
                <Link href={protectedHref(item)} key={item.target}>
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="side-panel support-panel">
            <h2>HỖ TRỢ CỬA HÀNG</h2>
            <p>Kiểm tra nhanh đơn hàng, sản phẩm hoặc kho, phù hợp với vai trò quản lý và giao dịch.</p>
            <Link href={protectedHref(homeProtectedLinks.staff)} className="side-primary">
              MỞ KHU NHÂN VIÊN
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
