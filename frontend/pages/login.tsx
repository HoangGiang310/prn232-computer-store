import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getAuth, getRedirectFromRole, login } from "../lib/auth";

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
      router.replace(getRedirectFromRole(auth.role));
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authData = await login(username.trim(), password);
      const destination = redirectQuery || getRedirectFromRole(authData.role);
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

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
        <p>
          Đăng nhập cho vai trò: {roleMap[selectedRole]?.label ?? "Người dùng"}.
          Vui lòng nhập tên đăng nhập và mật khẩu để truy cập.
        </p>
      </section>

      <section className="card login-card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>
              Tên đăng nhập
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </label>

            <label>
              Mật khẩu
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="buttons-group">
            <button
              type="submit"
              className="button login-button"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <button type="button" className={roleButton.className} disabled>
              {roleButton.label}
            </button>
          </div>

          <p className="signup-note">
            Nếu bạn chưa có tài khoản, vui lòng liên hệ quản trị viên để được
            cấp quyền.
          </p>

          <Link href="/" className="button back-button">
            Quay lại trang chủ
          </Link>
        </form>
      </section>

      <div className="copyright-row">
        <span className="copyright-line" />
        <p>© Copyright by DevTeam - Do not reup</p>
        <span className="copyright-line" />
      </div>
    </main>
  );
}
