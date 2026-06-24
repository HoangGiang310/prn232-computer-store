import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

const allowedRoles = ["staff", "sales"];

const quickActions = [
  {
    href: "/create-order",
    title: "Tạo đơn bán hàng",
    desc: "Xử lý giao dịch tại quầy, áp dụng voucher và chọn phương thức thanh toán.",
  },
  {
    href: "/orders",
    title: "Đơn hàng hôm nay",
    desc: "Theo dõi đơn online, offline, trạng thái vận chuyển và hoàn tiền.",
  },
  {
    href: "/inventory",
    title: "Kiểm tra kho",
    desc: "Xem tồn kho thực tế, cảnh báo sắp hết và cập nhật dữ liệu nhanh.",
  },
  {
    href: "/customers",
    title: "Khách hàng",
    desc: "Tra cứu lịch sử mua hàng, ghi chú và hỗ trợ khách khi cần.",
  },
];

const todayTasks = [
  "6 đơn mới cần xác nhận trong 30 phút.",
  "2 sản phẩm gần hết hàng cần báo cho quản lý kho.",
  "1 khách hàng cần gọi lại về đơn hủy.",
  "3 giao dịch thanh toán cần đối soát cuối ca.",
];

export default function StaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !allowedRoles.includes(auth.role)) {
      router.replace("/login?redirect=staff");
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
          <h1>Staff Web</h1>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="card role-hero role-hero-sales">
        <div className="role-pill">Vai trò: Nhân viên bán hàng</div>
        <h1>Bán hàng nhanh, rõ ràng và tập trung vào khách hàng</h1>
        <p className="role-subtle">
          Chào {username}. Giao diện này giúp bạn xử lý đơn hàng tại quầy, theo dõi tồn kho và chăm sóc khách hàng ngay trong một màn hình.
        </p>
        <div className="role-stat-grid">
          <div className="role-stat-card">
            <strong>06</strong>
            <span>Đơn mới chờ xử lý</span>
          </div>
          <div className="role-stat-card">
            <strong>POS</strong>
            <span>Tạo đơn nhanh</span>
          </div>
          <div className="role-stat-card">
            <strong>24/7</strong>
            <span>Hỗ trợ giao dịch</span>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="role-section-title">
          <h2>Truy cập nhanh</h2>
          <p>Tiếp cận các công việc thường dùng nhất cho nhân viên bán hàng.</p>
        </div>
        <div className="role-feature-grid">
          {quickActions.map((action) => (
            <Link href={action.href} className="role-action-card" key={action.href}>
              <strong>{action.title}</strong>
              <p>{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="role-section-title">
          <h2>Nhiệm vụ hôm nay</h2>
          <p>Danh sách ưu tiên giúp bạn làm việc hiệu quả hơn trong ca.</p>
        </div>
        <ul className="role-list">
          {todayTasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </section>

      <section className="card buttons-group">
        <button className="button" onClick={handleLogout}>
          Đăng xuất
        </button>
        <Link href="/" className="button back-button">
          Quay lại trang chủ
        </Link>
      </section>
    </main>
  );
}
