import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getAuth, getRedirectFromRole, login, logout } from "../lib/auth";

const redirectAccessMap: Record<string, { destination: string; roles: string[]; label: string }> = {
  admin: { destination: "/admin", roles: ["admin"], label: "Admin" },
  manager: {
    destination: "/manager",
    roles: ["manager", "warehouse", "admin"],
    label: "Quản lý kho",
  },
  staff: {
    destination: "/staff",
    roles: ["staff", "sales", "admin"],
    label: "Nhân viên",
  },
  bookkeeper: {
    destination: "/bookkeeper",
    roles: ["bookkeeper", "accountant", "admin"],
    label: "Kế toán",
  },
  customer: { destination: "/customer", roles: ["customer"], label: "Khách hàng" },
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const redirectQuery = Array.isArray(router.query.redirect)
    ? router.query.redirect[0]
    : router.query.redirect;

  useEffect(() => {
    if (typeof redirectQuery === "string") {
      setSelectedRole(redirectQuery);
    }
  }, [redirectQuery]);

  const roleMap: Record<string, { label: string; className: string }> = {
    admin: { label: "Admin", className: "button role-button admin" },
    manager: { label: "Quản lý kho", className: "button role-button manager" },
    bookkeeper: {
      label: "Kế toán",
      className: "button role-button bookkeeper",
    },
    staff: { label: "Nhân viên", className: "button role-button staff" },
    customer: { label: "Khách hàng", className: "button role-button customer" },
  };

  const roleButton =
    typeof redirectQuery === "string" && roleMap[redirectQuery]
      ? roleMap[redirectQuery]
      : { label: "Đăng ký", className: "button register-button" };

  useEffect(() => {
    const auth = getAuth();
    if (auth?.token) {
      if (typeof redirectQuery === "string" && redirectAccessMap[redirectQuery]) {
        const requestedAccess = redirectAccessMap[redirectQuery];
        if (requestedAccess.roles.includes(auth.role?.toLowerCase())) {
          router.replace(requestedAccess.destination);
        } else {
          logout();
          setError(`Chức năng này yêu cầu tài khoản ${requestedAccess.label}. Vui lòng đăng nhập đúng vai trò.`);
        }
        return;
      }

      router.replace(getRedirectFromRole(auth.role));
    }
  }, [redirectQuery, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authData = await login(username.trim(), password);
      if (typeof redirectQuery === "string" && redirectAccessMap[redirectQuery]) {
        const requestedAccess = redirectAccessMap[redirectQuery];
        if (!requestedAccess.roles.includes(authData.role?.toLowerCase())) {
          logout();
          setError(`Tài khoản này không có quyền ${requestedAccess.label}. Vui lòng đăng nhập đúng vai trò.`);
          return;
        }

        router.push(requestedAccess.destination);
        return;
      }

      const destination = getRedirectFromRole(authData.role);
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <header className="auth-topbar">
        <Link href="/" className="auth-back" aria-label="Quay lại trang chủ">
          ←
        </Link>
        <div className="auth-brand">
          <span className="auth-brand-mark">TQG</span>
          <span>COMPUTER STORE</span>
        </div>
      </header>

      <section className="auth-panel">
        <div className="auth-heading">
          <h1>Đăng nhập tài khoản</h1>
          <p>Sử dụng tài khoản hệ thống để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span className="auth-icon">⌕</span>
            <span className="auth-sr">Tên đăng nhập</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập hoặc Email"
              required
              autoFocus
            />
          </label>

          <label className="auth-field">
            <span className="auth-icon">▣</span>
            <span className="auth-sr">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
            />
            <span className="auth-eye" aria-hidden="true">
              ◉
            </span>
          </label>

          <div className="auth-field auth-role-field">
            <span className="auth-icon">♢</span>
            <span>Vai Trò: {roleMap[selectedRole]?.label ?? "Người dùng hệ thống"}</span>
          </div>

          <div className="auth-check-card">
            <span className="auth-check-icon">✓</span>
            <div>
              <strong>Sẵn sàng!</strong>
              <small>Thông tin được bảo mật trong hệ thống</small>
            </div>
          </div>

          {error ? <p className="auth-message auth-error">{error}</p> : null}

          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" defaultChecked />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link href="/login">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="auth-primary" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
          </button>

          <div className="auth-divider">
            <span />
            <em>Hoặc</em>
            <span />
          </div>

          <Link href="/register" className="auth-secondary">
            <span>♧</span>
            Đăng ký tài khoản mới
          </Link>

          <p className="auth-role-note">Vai trò đang chọn: {roleButton.label}</p>
        </form>
      </section>

      <footer className="auth-footer">© 2026 TQG Computer Store. All rights reserved.</footer>
    </main>
  );
}
