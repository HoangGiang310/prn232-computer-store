import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth.api";
import { Button } from "@/components/ui/button";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      onLogin(response.token);
      navigate("/products");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-slate-200">
      <h2 className="mb-4 text-3xl font-semibold text-slate-900">
        Đăng nhập hệ thống
      </h2>
      <p className="mb-8 text-sm text-slate-500">
        Nhập email và mật khẩu để truy cập trang quản trị bán hàng laptop.
      </p>

      {error ? (
        <div className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="admin@company.com"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="••••••••"
            required
          />
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </form>
    </div>
  );
}
