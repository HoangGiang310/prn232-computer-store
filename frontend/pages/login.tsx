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

  const redirectQuery = Array.isArray(router.query.redirect)
    ? router.query.redirect[0]
    : router.query.redirect;

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
        <h1>Đăng nhập</h1>
        <p>Nhập tên đăng nhập và mật khẩu để truy cập hệ thống.</p>
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
            <button type="submit" className="button login-button" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <button type="button" className="button register-button" disabled>
              Đăng ký
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
    </main>
  );
}
