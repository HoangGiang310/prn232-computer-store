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

        {auth ? (
          <button className="store-nav-button" onClick={handleLogout}>
            ĐĂNG XUẤT
          </button>
        ) : (
          <Link href="/login" className="store-nav-button">
            ĐĂNG NHẬP
          </Link>
        )}
      </nav>

      <section className="store-hero" aria-label="KHUYẾN MÃI MÁY TÍNH">
        <div className="hero-scene">
          <div className="scene-sign">
            <span>SIÊU ƯU ĐÃI</span>
            <strong>CÔNG NGHỆ</strong>
          </div>
          <div className="scene-lights">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="scene-shelf scene-shelf-left">
            <span className="box box-red" />
            <span className="box box-green" />
            <span className="box box-gold" />
          </div>
          <div className="scene-shelf scene-shelf-right">
            <span className="box box-blue" />
            <span className="box box-red" />
            <span className="box box-green" />
          </div>
          <div className="scene-desk">
            <div className="scene-monitor">
              <span className="screen-line wide" />
              <span className="screen-line" />
              <span className="screen-line short" />
            </div>
            <div className="scene-keyboard" />
            <div className="scene-tower">
              <span />
              <span />
            </div>
          </div>
          <div className="hero-badge">
            <span>GIẢM ĐẾN</span>
            <strong>30%</strong>
          </div>
          <div className="scene-plants left" />
          <div className="scene-plants right" />
        </div>
      </section>

      <section className="store-tabs" aria-label="ĐIỀU HƯỚNG NHANH">
        <Link href={protectedHref(homeProtectedLinks.products)} className="active">
          HÀNG MỚI
        </Link>
        <Link href={protectedHref(homeProtectedLinks.inventory)}>TỒN KHO</Link>
        <Link href={protectedHref(homeProtectedLinks.customers)}>KHÁCH HÀNG</Link>
        <Link href={protectedHref(homeProtectedLinks.vouchers)}>VOUCHER</Link>
      </section>

      <div className="store-layout">
        <section className="store-feed">
          <div className="feed-filter">
            <div>
              <span>TẤT CẢ SẢN PHẨM</span>
              <span>BÁN CHẠY</span>
              <span>ƯU ĐÃI</span>
            </div>
            <Link href={protectedHref(homeProtectedLinks.products)}>XEM TẤT CẢ</Link>
          </div>

          <article className="promo-post">
            <div className="post-author">
              <div className="avatar">T</div>
              <div>
                <strong>CỬA HÀNG TQG</strong>
                <small>CẬP NHẬT HÔM NAY</small>
              </div>
              <span className="pin-label">NỔI BẬT</span>
            </div>

            <h1>TRANG CHỦ CỬA HÀNG MÁY TÍNH</h1>
            <p>
              HỆ THỐNG BÁN HÀNG MÁY TÍNH VỚI GIAO DIỆN NHANH, RÕ RÀNG VÀ DỄ THAO TÁC CHO NHÂN VIÊN CỬA HÀNG.
            </p>

            <div className="home-product-grid">
              {(liveProducts.length > 0 ? liveProducts : []).map((product) => {
                const img =
                  product.images?.find((i: any) => i.isMain)?.imageUrl ||
                  product.images?.[0]?.imageUrl;
                return (
                  <Link href={`/product/${product.id}`} className="home-product-card" key={product.id}>
                    <div className="home-product-media">
                      {img ? <img src={img} alt={product.name} loading="lazy" /> : <span>💻</span>}
                      {product.brand ? <span className="home-product-brand">{product.brand}</span> : null}
                    </div>
                    <div className="home-product-info">
                      <h2>{product.name}</h2>
                      <p>{product.specifications}</p>
                      <strong>{Number(product.price).toLocaleString("vi-VN")} ₫</strong>
                    </div>
                  </Link>
                );
              })}
              {liveProducts.length === 0
                ? featuredProducts.map((product) => (
                    <div className="product-tile" key={product.name}>
                      <span className="product-tag">{product.tag}</span>
                      <div className="product-device">
                        <span className="device-screen" />
                        <span className="device-base" />
                      </div>
                      <h2>{product.name}</h2>
                      <p>{product.spec}</p>
                      <strong>{product.price}</strong>
                    </div>
                  ))
                : null}
            </div>
          </article>
        </section>

        <aside className="store-sidebar">
          <section className="side-panel">
            <h2>ĐĂNG NHẬP HỆ THỐNG</h2>
            {auth ? (
              <>
                <p>
                  XIN CHÀO <strong>{auth.username.toUpperCase()}</strong>. BẠN ĐANG Ở VAI TRÒ <strong>{getRoleLabel(auth.role)}</strong>.
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
            <p>CẦN KIỂM TRA ĐƠN, SẢN PHẨM HOẶC TỒN KHO? MỞ NHANH KHU VỰC QUẢN LÝ PHÙ HỢP.</p>
            <Link href={protectedHref(homeProtectedLinks.staff)} className="side-primary">
              ĐẾN KHU NHÂN VIÊN
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
