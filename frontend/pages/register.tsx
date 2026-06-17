import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getAuth, getRedirectFromRole, register } from "../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("customer");
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
    <main className="main">
      <section className="card header register-header">
        <div className="register-title-group">
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
          <p className="register-subtitle">
            Tạo tài khoản hệ thống với vai trò phù hợp. Chọn role trước khi hoàn tất đăng ký.
          </p>
        </div>
      </section>

      <section className="card login-card register-card">
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
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Họ và tên
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>

            <label>
              Số điện thoại
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </label>

            <label>
              Địa chỉ
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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

            <label>
              Xác nhận mật khẩu
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>

            <label>
              Vai trò tài khoản
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Khách hàng</option>
                <option value="admin">Admin</option>
                <option value="sales">Nhân viên bán hàng</option>
                <option value="accountant">Kế toán</option>
                <option value="warehouse">Quản lý kho</option>
              </select>
            </label>
          </div>

          {error ? <p className="error">{error}</p> : null}
          {success ? <p className="success">{success}</p> : null}

          <div className="buttons-group register-buttons">
            <button type="submit" className="button login-button" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
            <Link href="/" className="button back-button">
              Trở Về Trang Chủ
            </Link>
          </div>
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
