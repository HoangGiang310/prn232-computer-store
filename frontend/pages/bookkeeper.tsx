import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CustomerHeader from "../components/CustomerHeader";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["bookkeeper", "accountant"];

const financeHighlights = [
  { title: "Doanh thu hôm nay", value: "₫ 128.4M", note: "Tăng 8% so với ngày trước" },
  { title: "Lợi nhuận gộp", value: "₫ 41.2M", note: "Tỷ suất khá ổn định" },
  { title: "Công nợ chờ thu", value: "₫ 15.8M", note: "2 đơn cần theo dõi" },
  { title: "Hoàn tiền chờ xử lý", value: "3 yêu cầu", note: "Cần kiểm tra tình trạng vận chuyển" },
];

export default function BookkeeperPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !allowedRoles.includes(auth.role)) {
      router.replace("/login?redirect=bookkeeper");
      return;
    }

    setUsername(auth.username);
    setLoading(false);
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="main">
        <section className="card header">
          <h1>Bookkeeper Web</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page dashboard-bookkeeper-page">
      <CustomerHeader />
      <div className="dashboard-content">
        <section className="dashboard-hero role-hero role-hero-accounting">
        <div className="dashboard-hero-copy">
          <div className="role-pill">Vai trò: Kế toán & báo cáo</div>
          <h1>Giám sát số liệu kinh doanh và chi phí một cách rõ ràng</h1>
          <p className="role-subtle">
            Chào {username}. Giao diện này giúp bạn nắm nhanh doanh thu, lợi nhuận, công nợ và các giao dịch cần chú ý.
          </p>
          <div className="dashboard-hero-badges">
            {financeHighlights.map((item) => (
              <div className="dashboard-hero-badge" key={item.title}>
                <strong>{item.value}</strong>
                <span>{item.title}</span>
                <small>{item.note}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="role-section-title">
            <h2>Truy cập nhanh</h2>
            <p>Điều hướng tới các báo cáo và dữ liệu tài chính quan trọng.</p>
          </div>
          <div className="role-feature-grid">
            <Link href="/reports" className="role-action-card">
              <strong>Báo cáo & thống kê</strong>
              <p>Xem doanh thu, lợi nhuận, top sản phẩm và số liệu theo kênh bán hàng.</p>
            </Link>
            <Link href="/orders" className="role-action-card">
              <strong>Danh sách đơn hàng</strong>
              <p>Quản lý đơn hàng, trạng thái giao nhận và các yêu cầu hoàn tiền.</p>
            </Link>
            <Link href="/inventory" className="role-action-card">
              <strong>Báo cáo tồn kho</strong>
              <p>Liên kết số lượng tồn với doanh số để đánh giá ảnh hưởng tới lợi nhuận.</p>
            </Link>
            <Link href="/customers" className="role-action-card">
              <strong>Khách hàng & giao dịch</strong>
              <p>Tra cứu khách hàng, giao dịch và các khoản nợ cần theo dõi.</p>
            </Link>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="role-section-title">
            <h2>Điểm cần chú ý</h2>
            <p>Những mảng tài chính thường được kế toán theo dõi hàng ngày.</p>
          </div>
          <ul className="role-list">
            <li>Xem báo cáo doanh thu, lợi nhuận và đơn hàng một cách tuần tự.</li>
            <li>Kiểm tra sản phẩm bán chạy và tình trạng kho liên quan.</li>
            <li>Quản lý hoàn trả và các giao dịch thanh toán cần đối soát.</li>
            <li>Định hướng các con số thu chi cho bộ phận quản lý.</li>
          </ul>
        </section>
      </div>

      <section className="dashboard-card buttons-group">
        <button className="button" onClick={handleLogout}>
          Đăng xuất
        </button>
        <Link href="/" className="button back-button">
          Quay lại trang chủ
        </Link>
      </section>
      </div>
    </main>
  );
}
