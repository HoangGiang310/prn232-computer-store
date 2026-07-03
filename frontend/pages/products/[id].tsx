import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchProductById } from "../../lib/api";

type ProductDetail = {
  id: string;
  productCode: string;
  name: string;
  brand: string;
  category: string;
  specifications: string;
  importPrice: number;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images?: Array<{ id: string; imageUrl: string; isMain?: boolean }>;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        let productId: string | undefined;

        if (typeof id === "string") {
          productId = id;
        } else if (Array.isArray(id) && typeof id[0] === "string") {
          productId = id[0];
        }

        if (!productId) {
          if (isMounted) {
            setError("Không thể tải chi tiết sản phẩm.");
          }
          return;
        }

        const data = await fetchProductById(productId);
        if (isMounted) setProduct(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Không thể tải chi tiết sản phẩm.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [router.isReady, id]);

  if (loading) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Đang tải chi tiết sản phẩm...</h1>
        </section>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Không tìm thấy sản phẩm</h1>
          <p>{error || "Sản phẩm không tồn tại."}</p>
          <Link href="/products" className="button" style={{ marginTop: "12px" }}>
            Quay lại danh sách
          </Link>
        </section>
      </main>
    );
  }

  const stockStatus =
    product.stockQuantity === 0
      ? "Hết hàng"
      : product.stockQuantity <= product.lowStockThreshold
        ? "Gần hết"
        : "Còn hàng";

  return (
    <main className="main">
      <section className="card header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1>{product.name}</h1>
            <p>
              {product.category} · {product.brand} · {product.productCode}
            </p>
          </div>
          <div className="buttons-group">
            <Link href="/products" className="button">
              Quay lại
            </Link>
          </div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          <div>
            {product.images && product.images.length > 0 ? (
              <div style={{ display: "grid", gap: "12px" }}>
                <img
                  src={product.images.find((img) => img.isMain)?.imageUrl || product.images[0].imageUrl}
                  alt={product.name}
                  style={{ width: "100%", maxHeight: "420px", objectFit: "contain", background: "#f8fafc", borderRadius: "12px" }}
                />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {product.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt={product.name}
                      style={{ width: "96px", height: "96px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "12px" }}>
                Chưa có hình ảnh cho sản phẩm này.
              </div>
            )}
          </div>

          <div>
            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px" }}>
              <p style={{ margin: 0, color: "#6b7280" }}>Tình trạng kho</p>
              <h2 style={{ margin: "6px 0" }}>{stockStatus}</h2>
              <p style={{ margin: 0 }}>
                Còn lại: <strong>{product.stockQuantity}</strong> sản phẩm
              </p>
            </div>

            <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
              <div>
                <small style={{ color: "#6b7280" }}>Giá nhập</small>
                <h3>{product.importPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</h3>
              </div>
              <div>
                <small style={{ color: "#6b7280" }}>Giá bán</small>
                <h3 style={{ color: "#2563eb" }}>
                  {product.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Thông số kỹ thuật</h2>
        <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{product.specifications}</p>
      </section>
    </main>
  );
}
