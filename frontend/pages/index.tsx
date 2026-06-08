import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState("");
  const router = useRouter();

  const handleAccess = () => {
    if (selectedRole) {
      router.push(`/login?redirect=${selectedRole}`);
    }
  };

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
        <p>Cửa Hàng Laptop, Linh Kiện Điện Tử</p>
      </section>

      <div className="hero-grid">
        <section className="card poster-card">
          <div className="poster-art">
            <div className="poster-badge">TQG SHOP</div>
            <div className="poster-illustration laptop-illustration">
              <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="28" width="240" height="130" rx="18" fill="#2563EB" />
                <rect x="32" y="40" width="216" height="88" rx="12" fill="#fff" />
                <rect x="48" y="56" width="184" height="16" rx="8" fill="#e5e7eb" />
                <rect x="48" y="82" width="144" height="16" rx="8" fill="#e5e7eb" />
                <rect x="48" y="108" width="104" height="16" rx="8" fill="#e5e7eb" />
                <rect x="32" y="160" width="216" height="16" rx="8" fill="#374151" />
                <rect x="72" y="176" width="136" height="10" rx="5" fill="#9ca3af" />
                <circle cx="216" cy="46" r="8" fill="#f97316" />
                <circle cx="236" cy="46" r="8" fill="#10b981" />
              </svg>
            </div>
            <div className="poster-copy">
              <h3>Shop công nghệ hiện đại</h3>
              <p>Chuyên laptop, linh kiện và phụ kiện chất lượng cao.</p>
            </div>
          </div>
        </section>

        <section className="card role-section">
          <h2>Chọn vai trò để truy cập</h2>
          <div className="role-selector-wrapper">
            <select
              className="role-selector"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">-- Chọn vai trò --</option>
              <option value="admin">Admin</option>
              <option value="manager">Quản lý</option>
              <option value="bookkeeper">Kế toán</option>
              <option value="staff">Nhân viên</option>
              <option value="customer">Khách</option>
            </select>
            <button
              className="button access-button"
              onClick={handleAccess}
              disabled={!selectedRole}
            >
              Truy Cập
            </button>
          </div>
        </section>
      </div>

      <section className="card">
        <h2>Truy cập nhanh</h2>
        <div className="buttons-group" style={{ justifyContent: "center" }}>
          <Link href="/products" className="button">
            Quản lý sản phẩm
          </Link>
          <Link href="/orders" className="button">
            Quản lý đơn hàng
          </Link>
          <Link href="/inventory" className="button">
            Quản lý kho
          </Link>
        </div>
      </section>

      <div className="copyright-row">
        <span className="copyright-line" />
        <p>© Copyright by DevTeam - Do not reup</p>
        <span className="copyright-line" />
      </div>
    </main>
  );
}
