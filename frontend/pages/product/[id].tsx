import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import CustomerHeader from "../../components/CustomerHeader";
import { getAuth } from "../../lib/auth";
import {
  fetchProductById,
  fetchProductReviews,
  fetchReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from "../../lib/api";
import { addCheckoutItem, addBuyNowItem } from "../../lib/cart";

type Review = {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  customerId: string;
  createdAt: string;
  updatedAt?: string;
};

type ReviewData = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
  reviews: Review[];
};

function Stars({ value, onSelect }: { value: number; onSelect?: (v: number) => void }) {
  return (
    <span className="review-stars" role={onSelect ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`review-star ${n <= value ? "filled" : ""} ${onSelect ? "interactive" : ""}`}
          onClick={onSelect ? () => onSelect(n) : undefined}
          disabled={!onSelect}
          aria-label={`${n} sao`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const productId = typeof id === "string" ? id : "";

  const [product, setProduct] = useState<any>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & sorting
  const [sort, setSort] = useState("helpful");
  const [starFilter, setStarFilter] = useState<number | undefined>(undefined);

  // Auth & eligibility
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");
  const [isCustomer, setIsCustomer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (auth?.token) {
      setToken(auth.token);
      setUserRole(auth.role || "");
      setIsCustomer(auth.role?.toLowerCase() === "customer");
      setIsAdmin(auth.role?.toLowerCase() === "admin");
    }
  }, []);

  const isStaff = ["staff", "sales"].includes(userRole.toLowerCase());
  const isBookkeeper = ["bookkeeper", "accountant"].includes(userRole.toLowerCase());

  useEffect(() => {
    if (!productId) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, sort, starFilter]);

  useEffect(() => {
    if (!productId || !token || !isCustomer) return;
    fetchReviewEligibility(productId, token)
      .then((res) => {
        setCanReview(res.canReview);
        setHasReviewed(res.hasReviewed);
        setExistingReviewId(res.existingReviewId ?? null);
      })
      .catch(() => {
        /* không chặn trang nếu kiểm tra quyền lỗi */
      });
  }, [productId, token, isCustomer]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [prod, reviews] = await Promise.all([
        fetchProductById(productId),
        fetchProductReviews(productId, sort, starFilter),
      ]);
      setProduct(prod);
      setReviewData(reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  async function reloadReviews() {
    try {
      const reviews = await fetchProductReviews(productId, sort, starFilter);
      setReviewData(reviews);
    } catch {
      /* ignore */
    }
  }

  function openCreateForm() {
    setShowForm(true);
    setFormRating(5);
    setFormTitle("");
    setFormContent("");
    setFormError("");
    setFormSuccess("");
    setExistingReviewId(null);
  }

  function openEditForm(review: Review) {
    setShowForm(true);
    setFormRating(review.rating);
    setFormTitle(review.title);
    setFormContent(review.content);
    setExistingReviewId(review.id);
    setFormError("");
    setFormSuccess("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!token) {
      setFormError("Bạn cần đăng nhập bằng tài khoản khách hàng để đánh giá.");
      return;
    }
    if (formRating < 1 || formRating > 5) {
      setFormError("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    setSubmitting(true);
    try {
      if (existingReviewId) {
        await updateReview(
          existingReviewId,
          { rating: formRating, title: formTitle, content: formContent },
          token,
        );
        setFormSuccess("Đã cập nhật đánh giá của bạn.");
      } else {
        await createReview(
          { productId, rating: formRating, title: formTitle, content: formContent },
          token,
        );
        setFormSuccess("Đánh giá của bạn đã được gửi thành công!");
        setHasReviewed(true);
      }
      setShowForm(false);
      await reloadReviews();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thể gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!token) return;
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      await deleteReview(reviewId, token);
      setHasReviewed(false);
      setExistingReviewId(null);
      await reloadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa đánh giá.");
    }
  }

  async function handleHelpful(reviewId: string) {
    try {
      await markReviewHelpful(reviewId);
      await reloadReviews();
    } catch {
      /* ignore */
    }
  }

  function handleAddToCart() {
    if (!product) return;

    const auth = getAuth();
    if (!auth?.token || auth.role?.toLowerCase() !== "customer") {
      setCartMessage("Bạn cần phải đăng nhập mới có thể thêm sản phẩm");
      return;
    }

    addCheckoutItem({
      productId: product.id,
      name: product.name,
      productCode: product.productCode,
      category: product.category,
      brand: product.brand,
      price: Number(product.price ?? 0),
      quantity: 1,
      stockQuantity: Number(product.stockQuantity ?? 0),
      mainImage: product.images?.[0]?.imageUrl,
      specifications: product.specifications,
    });
    setCartMessage("Thêm sản phẩm thành công");
  }

  function handleBuyNow() {
    if (!product) return;
    addBuyNowItem({
      productId: product.id,
      name: product.name,
      productCode: product.productCode,
      category: product.category,
      brand: product.brand,
      price: Number(product.price ?? 0),
      quantity: 1,
      stockQuantity: Number(product.stockQuantity ?? 0),
      mainImage: product.images?.[0]?.imageUrl,
      specifications: product.specifications,
    });
    router.push("/checkout");
  }

  const myCustomerId = useMemo(() => {
    // Không có id khách trực tiếp ở client, dựa vào existingReviewId để nhận biết review của mình
    return existingReviewId;
  }, [existingReviewId]);

  if (loading) {
    return (
      <>
        <CustomerHeader />
        <main className="main">
          <section className="card header">
            <h1>Đang tải sản phẩm...</h1>
          </section>
        </main>
      </>
    );
  }

  if (error && !product) {
    return (
      <>
        <CustomerHeader />
        <main className="main">
          <section className="card header">
            <h1>Lỗi</h1>
            <p className="error">{error}</p>
            <Link href="/" className="button">
              Quay Lại Trang Chủ
            </Link>
          </section>
        </main>
      </>
    );
  }

  const dist = reviewData?.distribution ?? {};
  const total = reviewData?.totalReviews ?? 0;

  return (
    <>
      <CustomerHeader />
      <main className="main">
        <section className="card header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1>{product?.name}</h1>
              <p>{product?.category} · {product?.brand} · Mã: {product?.productCode}</p>
            </div>
            <Link href="/" className="button">
              ← Quay Lại Trang Chủ
            </Link>
          </div>
        </section>

      <section className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          <div className="pdp-gallery">
            {(() => {
              const img =
                product?.images?.find((i: any) => i.isMain)?.imageUrl ||
                product?.images?.[0]?.imageUrl;
              return img ? (
                <img src={img} alt={product?.name} className="pdp-image" />
              ) : (
                <div className="pdp-image-fallback">💻</div>
              );
            })()}
          </div>
          <div>
            <h2>Thông tin sản phẩm</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{product?.specifications}</p>
            <h2 style={{ marginTop: 18 }}>Giá bán</h2>
            <p className="pdp-price">
              {Number(product?.price ?? 0).toLocaleString("vi-VN")} ₫
            </p>
            <p>{product?.stockQuantity > 0 ? `Còn ${product?.stockQuantity} sản phẩm` : "Hết hàng"}</p>
            <div style={{ marginTop: 12 }}>
              <Stars value={Math.round(reviewData?.averageRating ?? 0)} />
              <span style={{ marginLeft: 8 }}>
                {reviewData?.averageRating ?? 0} / 5 ({total} đánh giá)
              </span>
            </div>
            <div className="buttons-group" style={{ marginTop: 16, justifyContent: "flex-start" }}>
              {isAdmin ? (
                <Link href="/products" className="button login-button">
                  Xem
                </Link>
              ) : isStaff ? (
                <Link href="/create-order" className="button login-button">
                  Tạo đơn bán hàng
                </Link>
              ) : isBookkeeper ? (
                <Link href="/reports" className="button login-button">
                  Báo cáo &amp; Thống kê
                </Link>
              ) : (
                <>
                  <button className="button login-button" onClick={handleBuyNow} disabled={Number(product?.stockQuantity ?? 0) <= 0}>
                    {Number(product?.stockQuantity ?? 0) <= 0 ? "Hết hàng" : "Mua Ngay"}
                  </button>
                  <button className="button" onClick={handleAddToCart} disabled={Number(product?.stockQuantity ?? 0) <= 0}>
                    {Number(product?.stockQuantity ?? 0) <= 0 ? "Hết hàng" : "Thêm Giỏ Hàng"}
                  </button>
                  <Link href="/cart" className="button">
                    Xem Giỏ Hàng
                  </Link>
                </>
              )}
            </div>
            {cartMessage ? (
              <p style={{ marginTop: 12, color: cartMessage.includes("thành công") ? "#15803d" : "#b91c1c" }}>
                {cartMessage}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <h2>Đánh giá &amp; Bình luận</h2>
          {isCustomer && canReview && !hasReviewed ? (
            <button className="button" onClick={openCreateForm}>
              Viết đánh giá
            </button>
          ) : null}
        </div>

        {!isCustomer ? (
          <p style={{ color: "#666" }}>
            Đăng nhập bằng tài khoản khách hàng đã mua sản phẩm để viết đánh giá.
          </p>
        ) : !canReview ? (
          <p style={{ color: "#666" }}>
            Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.
          </p>
        ) : null}

        {/* Rating distribution */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center", maxWidth: 420, marginTop: 12 }}>
          {[5, 4, 3, 2, 1].map((starLevel) => {
            const count = dist[String(starLevel)] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <>
                <span key={`l-${starLevel}`}>{starLevel} ★</span>
                <div key={`b-${starLevel}`} className="review-bar-track">
                  <div className="review-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span key={`c-${starLevel}`}>{count}</span>
              </>
            );
          })}
        </div>

        {/* Sort & filter controls */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <label>
            Sắp xếp:&nbsp;
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="helpful">Hữu ích nhất</option>
              <option value="newest">Mới nhất</option>
              <option value="highest">Đánh giá cao nhất</option>
              <option value="lowest">Đánh giá thấp nhất</option>
            </select>
          </label>
          <label>
            Lọc theo sao:&nbsp;
            <select
              value={starFilter ?? ""}
              onChange={(e) => setStarFilter(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </label>
        </div>

        {/* Review form */}
        {showForm ? (
          <form onSubmit={handleSubmit} className="login-form" style={{ marginTop: 16, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
            <h3>{existingReviewId ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}</h3>
            <div className="input-group">
              <label>
                Số sao
                <div>
                  <Stars value={formRating} onSelect={setFormRating} />
                </div>
              </label>
              <label>
                Tiêu đề (tùy chọn)
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={150}
                  placeholder="Ví dụ: Laptop tốt, giá hợp lý"
                />
              </label>
              <label>
                Nội dung
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  required
                />
              </label>
            </div>
            {formError ? <p className="error">{formError}</p> : null}
            <div className="buttons-group" style={{ gap: 12 }}>
              <button type="submit" className="button login-button" disabled={submitting}>
                {submitting ? "Đang gửi..." : existingReviewId ? "Lưu thay đổi" : "Gửi đánh giá"}
              </button>
              <button type="button" className="button" onClick={() => setShowForm(false)}>
                Hủy
              </button>
            </div>
          </form>
        ) : null}

        {formSuccess ? <p className="success" style={{ marginTop: 12 }}>{formSuccess}</p> : null}

        {/* Review list */}
        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          {reviewData && reviewData.reviews.length > 0 ? (
            reviewData.reviews.map((review) => {
              const isMine = myCustomerId === review.id || existingReviewId === review.id;
              return (
                <div key={review.id} className="order-card">
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <strong>{review.customerName || "Khách hàng"}</strong>
                      {review.isVerifiedPurchase ? (
                        <span style={{ marginLeft: 8, color: "#1a8917", fontSize: "0.85rem" }}>
                          ✓ Đã mua hàng
                        </span>
                      ) : null}
                    </div>
                    <Stars value={review.rating} />
                  </div>
                  {review.title ? <p style={{ fontWeight: 600, marginTop: 6 }}>{review.title}</p> : null}
                  <p style={{ whiteSpace: "pre-wrap" }}>{review.content}</p>
                  <p style={{ color: "#888", fontSize: "0.85rem" }}>
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    {review.updatedAt ? " (đã chỉnh sửa)" : ""}
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                    <button className="button" onClick={() => handleHelpful(review.id)}>
                      👍 Hữu ích ({review.helpfulCount})
                    </button>
                    {isMine ? (
                      <>
                        <button className="button" onClick={() => openEditForm(review)}>
                          Sửa
                        </button>
                        <button className="button" onClick={() => handleDelete(review.id)}>
                          Xóa
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <p>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
          )}
        </div>
      </section>
    </main>
    </>
  );
}
