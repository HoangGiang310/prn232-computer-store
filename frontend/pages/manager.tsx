import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CustomerHeader from "../components/CustomerHeader";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["manager", "warehouse"];

const warehouseHighlights = [
  { title: "Tổng tồn kho", value: "1,248 SKU", note: "Cập nhật realtime" },
  { title: "Sắp hết hàng", value: "12 sản phẩm", note: "Cần ưu tiên nhập thêm" },
  { title: "Đơn cần xử lý", value: "8 đơn", note: "Đang chờ xuất kho" },
  { title: "Lịch sử điều chỉnh", value: "96 lần", note: "Theo dõi nguồn gốc thay đổi" },
];

export default function ManagerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !allowedRoles.includes(auth.role)) {
      router.replace("/login?redirect=manager");
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
          <h1>Manager Web</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page dashboard-manager-page">
      <CustomerHeader />
      <div className="dashboard-content">
        <section className="dashboard-hero role-hero role-hero-warehouse">
        <div className="dashboard-hero-copy">
          <div className="role-pill">Vai trò: Quản lý kho</div>
          <h1>Kiểm soát hàng tồn, nhập xuất và cảnh báo thiếu hàng</h1>
          <p className="role-subtle">
            Chào {username}. Đây là trung tâm giúp bạn giám sát kho hàng, theo dõi thay đổi và phản ứng nhanh khi mức tồn thấp.
          </p>
          <div className="dashboard-hero-badges">
            {warehouseHighlights.map((item) => (
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
            <h2>Chức năng chính</h2>
            <p>Điều hướng nhanh đến các công việc quản lý kho và theo dõi tồn kho.</p>
          </div>

          <div className="role-feature-grid">
            <Link href="/inventory" className="role-action-card">
              <strong>Quản lý tồn kho</strong>
              <p>Xem và điều chỉnh số lượng, cảnh báo mức tồn thấp và theo dõi biến động kho.</p>
            </Link>
            <Link href="/products" className="role-action-card">
              <strong>Danh sách sản phẩm</strong>
              <p>Kiểm tra thông tin sản phẩm, giá bán, hình ảnh và trạng thái tồn kho.</p>
            </Link>
            <Link href="/orders" className="role-action-card">
              <strong>Theo dõi đơn hàng</strong>
              <p>Đảm bảo đơn hàng được xuất kho đúng thời điểm và không phát sinh sai sót.</p>
            </Link>
            <Link href="/reports" className="role-action-card">
              <strong>Báo cáo tồn kho</strong>
              <p>Phân tích hàng chậm tiêu thụ, hàng cũ và các mặt hàng cần bổ sung.</p>
            </Link>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="role-section-title">
            <h2>Lưu ý vai trò</h2>
            <p>Những nhiệm vụ trọng tâm của người quản lý kho.</p>
          </div>
          <ul className="role-list">
            <li>Xem và điều chỉnh tồn kho theo tình hình thực tế.</li>
            <li>Kiểm tra lịch sử điều chỉnh kho để truy xuất nguyên nhân thay đổi.</li>
            <li>Giám sát tình trạng hàng hóa và cảnh báo tồn kho thấp kịp thời.</li>
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
