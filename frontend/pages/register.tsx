import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getAuth, getRedirectFromRole, register } from "../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role] = useState("customer");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth?.token) {
      router.replace(getRedirectFromRole(auth.role));
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const authData = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });

      setSuccess("Đăng ký thành công. Đang chuyển hướng...");
      router.push(getRedirectFromRole(authData.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen auth-register-screen">
      <header className="auth-topbar">
        <Link href="/" className="auth-back" aria-label="Quay lại trang chủ">
          ←
        </Link>
        <div className="auth-brand">
          <span className="auth-brand-mark">TQG</span>
          <span>COMPUTER STORE</span>
        </div>
      </header>

      <section className="auth-panel auth-register-panel">
        <div className="auth-heading">
          <h1>Đăng ký tài khoản</h1>
          <p>Khởi tạo tài khoản khách hàng để sử dụng đầy đủ showroom online.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form auth-register-form">
          <div className="auth-form-grid">
            <label className="auth-field input-group">
              <span>Tên đăng nhập</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                required
                autoFocus
              />
            </label>

            <label className="auth-field input-group">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </label>

            <label className="auth-field input-group">
              <span>Họ và tên</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
              />
            </label>

            <label className="auth-field input-group">
              <span>Số điện thoại</span>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Số điện thoại"
              />
            </label>

            <label className="auth-field input-group">
              <span>Địa chỉ</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ"
              />
            </label>

            <label className="auth-field input-group">
              <span>Mật khẩu</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                required
              />
            </label>

            <label className="auth-field input-group">
              <span>Xác nhận mật khẩu</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu"
                required
              />
            </label>
          </div>

          <input type="hidden" value={role} />

          {error ? <p className="auth-message auth-error">{error}</p> : null}
          {success ? <p className="auth-message auth-success">{success}</p> : null}

          <button type="submit" className="auth-primary" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký ngay"}
          </button>

          <div className="auth-divider">
            <span />
            <em>Hoặc</em>
            <span />
          </div>

          <Link href="/login" className="auth-secondary">
            <span>↪</span>
            Đã có tài khoản
          </Link>
        </form>
      </section>

      <footer className="auth-footer">© 2026 TQG Computer Store. All rights reserved.</footer>
    </main>
  );
}
