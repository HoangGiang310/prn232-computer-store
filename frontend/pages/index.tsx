import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuth, getRedirectFromRole, logout } from "../lib/auth";

export default function Home() {
  const [auth, setAuth] = useState<{ token: string; role: string; username: string } | null>(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  function handleLogout() {
    logout();
    setAuth(null);
  }

  return (
    <main className="main">
      <header className="site-header card header hero-card">
        <div className="site-branding">
          <div className="brand-mark">TQG</div>
          <div>
            <p className="brand-label">TQG Computer Store</p>
            <p className="brand-note">Máy tính - Laptop - Phụ kiện | Quản lý bán hàng thông minh</p>
          </div>
        </div>

        <div className="hero-top">
          <div className="hero-copy">
            <p className="eyebrow">Chuyển đổi bán hàng máy tính</p>
            <h1>Hệ thống quản lý và bán hàng máy tính chuyên nghiệp</h1>
            <p className="hero-subtitle">
              TQG Computer Store mang đến giải pháp mua sắm trực tuyến và quản lý kho hàng cho cửa hàng máy tính của bạn.
              Quản lý sản phẩm, tạo đơn hàng nhanh và theo dõi doanh thu một cách trực quan.
            </p>

            <div className="home-action-buttons">
              {auth ? (
                <>
                  <Link href={getRedirectFromRole(auth.role)} className="button home-primary-button">
                    Vào Bảng Điều Khiển
                  </Link>
                  <button className="button home-secondary-button" onClick={handleLogout}>
                    Đăng Xuất
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" className="button home-primary-button">
                    Đăng Ký Ngay
                  </Link>
                  <Link href="/login" className="button home-secondary-button">
                    Đăng Nhập
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-card-panel">
              <div className="hero-panel-header">
                <span className="panel-title">TQG COMPUTER</span>
                <span className="panel-status">Mới</span>
              </div>
              <div className="panel-metrics">
                <div>
                  <strong>250+</strong>
                  <span>Sản phẩm</span>
                </div>
                <div>
                  <strong>1.200</strong>
                  <span>Đơn hàng</span>
                </div>
                <div>
                  <strong>98%</strong>
                  <span>Khách hàng hài lòng</span>
                </div>
              </div>
              <div className="panel-details">
                <p>Trang quản lý giúp bạn kiểm soát số lượng sản phẩm, theo dõi hóa đơn và xử lý trả hàng rõ ràng.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="card feature-section">
        <div className="section-header">
          <h2>Những gì TQG Computer Store hỗ trợ</h2>
          <p>Giao diện trực quan, thao tác nhanh, phù hợp cho cửa hàng máy tính, laptop và phụ kiện.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Quản lý sản phẩm</h3>
            <p>Thêm, sửa, xóa và điều chỉnh tồn kho cho sản phẩm nhanh chóng trong một nơi duy nhất.</p>
          </div>
          <div className="feature-card">
            <h3>Đơn hàng trực tuyến</h3>
            <p>Nhận đơn nhanh, theo dõi trạng thái và xử lý trả hàng ngay trên hệ thống.</p>
          </div>
          <div className="feature-card">
            <h3>Quản trị cho admin</h3>
            <p>Phân quyền rõ ràng, chức năng báo cáo và quản lý khách hàng chuyên nghiệp.</p>
          </div>
        </div>
      </section>

      <section className="card about-section">
        <div>
          <h2>Về cửa hàng của chúng tôi</h2>
          <p>
            TQG Computer Store là cửa hàng máy tính chuyên cung cấp laptop, linh kiện và dịch vụ bán hàng toàn diện.
            Hệ thống này được xây dựng để hỗ trợ bán hàng tại quầy và quản lý kho hiệu quả cho doanh nghiệp nhỏ.
          </p>
        </div>
        <div className="about-stats">
          <div>
            <strong>4.9/5</strong>
            <span>Đánh giá khách hàng</span>
          </div>
          <div>
            <strong>30+</strong>
            <span>Loại sản phẩm</span>
          </div>
          <div>
            <strong>7</strong>
            <span>Ngày đổi trả</span>
          </div>
        </div>
      </section>

      <div className="copyright-row">
        <span className="copyright-line" />
        <p>© 2026 TQG Computer Store</p>
        <span className="copyright-line" />
      </div>
    </main>
  );
}
