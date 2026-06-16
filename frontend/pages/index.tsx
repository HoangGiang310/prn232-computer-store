import Link from "next/link";

export default function Home() {
  return (
    <main className="main">
      <section className="card header">
        <h1 className="shop-title">
          <span className="colored-letter letter-1">T</span>
          <span className="colored-letter letter-2">Q</span>
          <span className="colored-letter letter-3">G</span>
          <span className="colored-letter letter-space"> </span>
          <span className="colored-letter letter-4">S</span>
          <span className="colored-letter letter-5">H</span>
          <span className="colored-letter letter-6">O</span>
          <span className="colored-letter letter-7">P</span>
        </h1>
        <p>Giao diện shop bán laptop và quản lý bán hàng cho giai đoạn phát triển.</p>
      </section>

      <section className="card header home-hero">
        <div className="hero-top">
          <h1 className="shop-title">
            <span className="colored-letter letter-1">T</span>
            <span className="colored-letter letter-2">Q</span>
            <span className="colored-letter letter-3">G</span>
            <span className="colored-letter letter-space"> </span>
            <span className="colored-letter letter-4">S</span>
            <span className="colored-letter letter-5">H</span>
            <span className="colored-letter letter-6">O</span>
            <span className="colored-letter letter-7">P</span>
          </h1>
          <p className="hero-subtitle">
            Giao diện shop laptop chuyên nghiệp với quản lý đơn hàng, tồn kho và tạo đơn hàng nhanh.
          </p>
        </div>
        <div className="hero-badge-row">
          <div className="poster-badge">TQG SHOP</div>
          <span className="badge-note">Phiên bản phát triển giao diện</span>
        </div>
      </section>

      <section className="card home-action-card">
        <Link href="/admin" className="button home-primary-button">
          Bảng Điều Khiển
        </Link>
      </section>

      <div className="copyright-row">
        <span className="copyright-line" />
        <p>© 2026 TQG Shop - Giai đoạn phát triển giao diện</p>
        <span className="copyright-line" />
      </div>
    </main>
  );
}
