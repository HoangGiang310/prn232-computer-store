import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, getRedirectFromRole, logout } from "../lib/auth";

type CustomerHeaderProps = {
  initialSearch?: string;
  onSearch?: (query: string) => void;
};

const homeProtectedLinks = {
  products: {
    target: "/products",
    loginRole: "manager",
    roles: ["manager", "warehouse", "admin"],
  },
  orders: {
    target: "/orders",
    loginRole: "staff",
    roles: ["staff", "sales", "admin"],
  },
  reports: {
    target: "/reports",
    loginRole: "bookkeeper",
    roles: ["bookkeeper", "accountant", "admin"],
  },
};

export default function CustomerHeader({
  initialSearch = "",
  onSearch,
}: CustomerHeaderProps) {
  const router = useRouter();
  const [auth, setAuth] = useState<{
    token: string;
    role: string;
    username: string;
  } | null>(null);
  const [searchInput, setSearchInput] = useState(initialSearch);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  function handleLogout() {
    logout();
    setAuth(null);
    router.push("/login");
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchInput.trim();
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/?search=${encodeURIComponent(query)}`);
    }
  }

  function protectedHref(config: {
    target: string;
    loginRole: string;
    roles: string[];
  }) {
    const currentRole = auth?.role?.toLowerCase();
    if (auth?.token && currentRole && config.roles.includes(currentRole)) {
      return config.target;
    }

    return `/login?redirect=${config.loginRole}`;
  }

  const isCustomer = !auth?.role || auth?.role?.toLowerCase() === "customer";

  return (
    <nav className="store-nav">
      <Link href="/" className="store-logo" aria-label="TQG Computer Store">
        <span className="store-logo-chip">TQG</span>
        <span>
          <strong>CỬA HÀNG MÁY TÍNH</strong>
          <small>LAPTOP - PC - LINH KIỆN</small>
        </span>
      </Link>

      {isCustomer ? (
        <form
          className="store-search-form"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <input
            type="text"
            className="store-search-input"
            placeholder="Nhập tên sản phẩm cần tìm kiếm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Tìm kiếm sản phẩm theo tên"
          />
          <button
            type="submit"
            className="store-search-button"
            aria-label="Tìm kiếm"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      ) : (
        <div className="store-nav-links">
          <Link href="/">TRANG CHỦ</Link>
          <Link href={protectedHref(homeProtectedLinks.products)}>
            SẢN PHẨM
          </Link>
          <Link href={protectedHref(homeProtectedLinks.orders)}>ĐƠN HÀNG</Link>
          <Link href={protectedHref(homeProtectedLinks.reports)}>BÁO CÁO</Link>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {auth?.role?.toLowerCase() === "customer" ? (
          <>
            <Link
              href="/order-history"
              className="store-nav-button"
              style={{ textDecoration: "none" }}
            >
              LỊCH SỬ ĐƠN
            </Link>
            <Link
              href="/cart"
              className="store-nav-button"
              style={{ textDecoration: "none" }}
            >
              GIỎ HÀNG
            </Link>
          </>
        ) : null}
        {auth?.role && auth.role.toLowerCase() !== "customer" ? (
          <Link
            href={getRedirectFromRole(auth.role)}
            className="store-nav-button"
            style={{ textDecoration: "none" }}
          >
            BẢNG ĐIỀU KHIỂN
          </Link>
        ) : null}
        {auth ? (
          <button className="store-nav-button" onClick={handleLogout}>
            ĐĂNG XUẤT
          </button>
        ) : (
          <Link href="/login" className="store-nav-button">
            ĐĂNG NHẬP
          </Link>
        )}
      </div>
    </nav>
  );
}
