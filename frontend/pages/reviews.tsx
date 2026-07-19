import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminHeader from "../components/AdminHeader";
import { getAuth, getRedirectFromRole, logout } from "../lib/auth";
import { fetchAllReviewsForAdmin, setReviewVisibility } from "../lib/api";

type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  isHidden: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token) {
      router.replace("/login?redirect=reviews");
      return;
    }
    if (auth.role?.toLowerCase() !== "admin") {
      router.replace(getRedirectFromRole(auth.role));
      return;
    }
    setToken(auth.token);
    load(auth.token);
  }, [router]);

  async function load(authToken: string) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllReviewsForAdmin(authToken);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đánh giá.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(review: AdminReview) {
    if (!token) return;
    try {
      await setReviewVisibility(review.id, !review.isHidden, token);
      setReviews((current) =>
        current.map((r) => (r.id === review.id ? { ...r, isHidden: !r.isHidden } : r)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  const filtered = reviews.filter((r) => {
    if (filter === "visible") return !r.isHidden;
    if (filter === "hidden") return r.isHidden;
    return true;
  });

  return (
    <>
      <AdminHeader />
      <main className="main">
      <section className="card header">
        <div className="order-card-header">
          <div>
            <h1>Kiểm duyệt đánh giá sản phẩm</h1>
            <p>Xem, ẩn hoặc hiện lại các bình luận của khách hàng.</p>
          </div>
          <div className="buttons-group">
            <Link href="/admin" className="button back-button">
              ← Bảng điều khiển
            </Link>
            <button className="button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="input-group input-group-inline">
          <label>
            Lọc
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="all">Tất cả</option>
              <option value="visible">Đang hiển thị</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </label>
          <div className="review-count">Tổng: {filtered.length} đánh giá</div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {loading ? (
          <p>Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p>Không có đánh giá nào.</p>
        ) : (
          <div className="review-list">
            {filtered.map((review) => (
              <div
                key={review.id}
                className={`order-card${review.isHidden ? " dimmed-row" : ""}`}
              >
                <div className="order-card-header">
                  <div>
                    <strong>{review.productName}</strong>
                    <p className="subtext">
                      {review.customerName} · {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                      {review.isVerifiedPurchase ? " · ✓ Đã mua" : ""}
                    </p>
                  </div>
                  <span className={review.isHidden ? "status-pill status-inactive" : "status-pill status-active"}>
                    {review.isHidden ? "ĐÃ ẨN" : "HIỂN THỊ"}
                  </span>
                </div>
                {review.title ? <p className="review-title">{review.title}</p> : null}
                <p className="review-content">{review.content}</p>
                <div className="review-footer">
                  <span>{new Date(review.createdAt).toLocaleString("vi-VN")} · 👍 {review.helpfulCount}</span>
                  <button className="button button-small" onClick={() => toggleVisibility(review)}>
                    {review.isHidden ? "Hiện lại" : "Ẩn bình luận"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
    </>
  );
}
