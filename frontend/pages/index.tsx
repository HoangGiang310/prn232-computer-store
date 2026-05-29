import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState("");
  const router = useRouter();

  const handleAccess = () => {
    if (selectedRole) {
      router.push(`/login?redirect=${selectedRole}`);
    }
  };

  return (
    <main className="main">
      <section className="card header">
        <h1>COMPUTER STORE</h1>
        <p>Cửa Hàng Laptop, Linh Kiện Điện Tử</p>
      </section>

      <section className="card role-section">
        <h2>Chọn vai trò để truy cập</h2>
        <div className="role-selector-wrapper">
          <select
            className="role-selector"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Chọn vai trò --</option>
            <option value="admin">Admin</option>
            <option value="staff">Nhân viên</option>
            <option value="customer">Khách hàng</option>
            <option value="bookkeeper">Kế toán</option>
            <option value="manager">Quản lý kho</option>
          </select>
          <button
            className="button access-button"
            onClick={handleAccess}
            disabled={!selectedRole}
          >
            Truy Cập
          </button>
        </div>
      </section>
    </main>
  );
}
