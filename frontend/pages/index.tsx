import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerHeader from "../components/CustomerHeader";
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
  {
    target: "/products",
    loginRole: "manager",
    roles: ["manager", "warehouse", "admin"],
    label: "SẢN PHẨM",
  },
  {
    target: "/create-order",
    loginRole: "staff",
    roles: ["staff", "sales", "admin"],
    label: "TẠO ĐƠN",
  },
  {
    target: "/orders",
    loginRole: "staff",
    roles: ["staff", "sales", "admin"],
    label: "ĐƠN HÀNG",
  },
  {
    target: "/inventory",
    loginRole: "manager",
    roles: ["manager", "warehouse", "admin"],
    label: "KHO HÀNG",
  },
];

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
  inventory: {
    target: "/inventory",
    loginRole: "manager",
    roles: ["manager", "warehouse", "admin"],
  },
  customers: {
    target: "/customers",
    loginRole: "staff",
    roles: ["staff", "sales", "admin"],
  },
  vouchers: { target: "/vouchers", loginRole: "admin", roles: ["admin"] },
  staff: { target: "/staff", loginRole: "staff", roles: ["staff", "sales"] },
};

export default function Home() {
  const router = useRouter();
  const [auth, setAuth] = useState<{
    token: string;
    role: string;
    username: string;
  } | null>(null);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setAuth(getAuth());
    fetchProducts()
      .then((data) => setLiveProducts(Array.isArray(data) ? data : []))
      .catch(() => setLiveProducts([]));
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.search) {
      const q = String(router.query.search);
      setSearchInput(q);
      setSearchQuery(q);
    }
  }, [router.isReady, router.query.search]);

  function handleLogout() {
    logout();
    setAuth(null);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchQuery("");
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

  function getRoleLabel(role: string) {
    return roleLabels[role?.toLowerCase()] ?? role.toUpperCase();
  }

  const isCustomer = !auth?.role || auth?.role?.toLowerCase() === "customer";

  const filteredProducts = (liveProducts.length > 0 ? liveProducts : []).filter(
    (product) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return product.name?.toLowerCase().includes(q);
    }
  );

  if (isCustomer) {
    return (
      <main className="store-home">
        <CustomerHeader
          initialSearch={searchQuery}
          onSearch={(query) => {
            setSearchInput(query);
            setSearchQuery(query);
          }}
        />

        <div className="store-layout">
          <section className="store-feed">
            {searchQuery.trim() && (
              <div className="store-search-status">
                <span>
                  Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong> ({filteredProducts.length} sản phẩm)
                </span>
                <button
                  type="button"
                  className="store-search-clear-btn"
                  onClick={handleClearSearch}
                >
                  ✕ Xóa tìm kiếm
                </button>
              </div>
            )}

            <div className="home-product-grid">
              {filteredProducts.map((product) => {
                const img =
                  product.images?.find((i: any) => i.isMain)?.imageUrl ||
                  product.images?.[0]?.imageUrl;

                return (
                  <Link
                    href={`/product/${product.id}`}
                    className="home-product-card"
                    key={product.id}
                  >
                    <div className="home-product-media">
                      {img ? (
                        <img src={img} alt={product.name} loading="lazy" />
                      ) : (
                        <span>💻</span>
                      )}

                      {product.brand && (
                        <span className="home-product-brand">
                          {product.brand}
                        </span>
                      )}
                    </div>

                    <div className="home-product-info">
                      <h2>{product.name}</h2>

                      {product.category && (
                        <p className="home-product-category">
                          {product.category}
                        </p>
                      )}

                      <p>{product.specifications}</p>

                      <strong>
                        {Number(product.price).toLocaleString("vi-VN")} ₫
                      </strong>
                    </div>
                  </Link>
                );
              })}

              {liveProducts.length === 0 &&
                featuredProducts
                  .filter((p) =>
                    !searchQuery.trim()
                      ? true
                      : p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
                  )
                  .map((product) => (
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
                  ))}
            </div>

            {filteredProducts.length === 0 &&
              liveProducts.length > 0 &&
              searchQuery.trim() !== "" && (
                <div className="store-search-empty">
                  <span style={{ fontSize: "2.5rem" }}>🔍</span>
                  <h3>Không tìm thấy sản phẩm nào</h3>
                  <p>Không có sản phẩm nào khớp với tên "{searchQuery}"</p>
                  <button
                    type="button"
                    className="store-nav-button"
                    onClick={handleClearSearch}
                    style={{ marginTop: "12px", background: "#4338ca" }}
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="store-home">
      <CustomerHeader />

      <section className="store-tabs" aria-label="ĐIỀU HƯỚNG NHANH">
        <Link
          href={protectedHref(homeProtectedLinks.products)}
          className="active"
        >
          SẢN PHẨM
        </Link>
        <Link href={protectedHref(homeProtectedLinks.inventory)}>KHO HÀNG</Link>
        <Link href={protectedHref(homeProtectedLinks.customers)}>
          KHÁCH HÀNG
        </Link>
        <Link href={protectedHref(homeProtectedLinks.vouchers)}>VOUCHER</Link>
      </section>

      <div className="store-layout">
        <section className="store-feed">
          <div className="home-product-grid">
            {liveProducts.map((product) => {
              const img =
                product.images?.find((i: any) => i.isMain)?.imageUrl ||
                product.images?.[0]?.imageUrl;

              return (
                <Link
                  href={`/product/${product.id}`}
                  className="home-product-card"
                  key={product.id}
                >
                  <div className="home-product-media">
                    {img ? (
                      <img src={img} alt={product.name} loading="lazy" />
                    ) : (
                      <span>💻</span>
                    )}

                    {product.brand && (
                      <span className="home-product-brand">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  <div className="home-product-info">
                    <h2>{product.name}</h2>

                    {product.category && (
                      <p className="home-product-category">
                        {product.category}
                      </p>
                    )}

                    <p>{product.specifications}</p>

                    <strong>
                      {Number(product.price).toLocaleString("vi-VN")} ₫
                    </strong>
                  </div>
                </Link>
              );
            })}

            {liveProducts.length === 0 &&
              featuredProducts.map((product) => (
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
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

