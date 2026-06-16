import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} from "../lib/api";
import { getAuth } from "../lib/auth";

type UserAccount = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
};

const roles = [
  { value: "admin", label: "Admin" },
  { value: "sales", label: "Nhân viên Bán hàng (Sales)" },
  { value: "accountant", label: "Kế toán (Accountant)" },
  { value: "warehouse", label: "Thủ kho (Warehouse)" },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("sales");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "admin") {
      router.replace("/login?redirect=admin");
      return;
    }
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách tài khoản.");
    }
  }

  function handleOpenCreate() {
    setEditMode(false);
    setSelectedUser(null);
    setUsername("");
    setFullName("");
    setEmail("");
    setRoleName("sales");
    setPassword("");
    setIsActive(true);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleOpenEdit(user: UserAccount) {
    setEditMode(true);
    setSelectedUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setEmail(user.email || "");
    setRoleName(user.roleName);
    setIsActive(user.isActive);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = getAuth()?.token;
      if (editMode && selectedUser) {
        const payload = {
          fullName,
          email,
          roleName,
          isActive,
        };
        await updateUser(selectedUser.id, payload, token);
        setSuccess("Cập nhật thông tin nhân viên thành công.");
      } else {
        const payload = {
          username,
          fullName,
          email,
          roleName,
          passwordHash: password, // Sẽ được băm ở backend
        };
        await createUser(payload, token);
        setSuccess("Tạo tài khoản nhân viên thành công.");
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(user: UserAccount) {
    const newPass = prompt(`Nhập mật khẩu mới cho nhân viên ${user.fullName}:`, "Staff@123");
    if (newPass === null) return;
    if (!newPass.trim()) {
      alert("Mật khẩu không được để trống!");
      return;
    }

    try {
      const token = getAuth()?.token;
      const res = await resetUserPassword(user.id, newPass.trim(), token);
      alert(res.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi reset mật khẩu.");
    }
  }

  async function handleToggleStatus(user: UserAccount) {
    const newStatus = !user.isActive;
    const confirmMsg = newStatus 
      ? `Bạn muốn KÍCH HOẠT lại tài khoản của ${user.fullName}?`
      : `Bạn có chắc chắn muốn VÔ HIỆU HÓA tài khoản của ${user.fullName}?`;

    if (!confirm(confirmMsg)) return;

    try {
      const token = getAuth()?.token;
      if (newStatus) {
        await updateUser(user.id, { ...user, isActive: true }, token);
        setSuccess(`Đã kích hoạt tài khoản cho ${user.fullName}.`);
      } else {
        await deleteUser(user.id, token);
        setSuccess(`Đã vô hiệu hóa tài khoản của ${user.fullName}.`);
      }
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thay đổi trạng thái.");
    }
  }

  return (
    <main className="main">
      <section className="card header">
        <h1>Quản lý người dùng & Nhân viên</h1>
        <p>Quản trị tài khoản các nhân viên bán hàng, thủ kho, kế toán và phân quyền truy cập hệ thống.</p>
      </section>

      <div className="buttons-group" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="button" onClick={() => router.back()}>
          Quay lại
        </button>
        <button className="button login-button" onClick={handleOpenCreate}>
          Tạo tài khoản mới
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      {showForm ? (
        <section className="card">
          <h2>{editMode ? `Chỉnh sửa thông tin nhân viên: ${username}` : "Tạo tài khoản nhân viên mới"}</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>
                Tên đăng nhập (Username) *
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={editMode}
                  required
                />
              </label>
              <label>
                Họ và tên *
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>
              <label>
                Email nhân viên
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Vai trò hệ thống *
                <select value={roleName} onChange={(e) => setRoleName(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              {!editMode && (
                <label>
                  Mật khẩu khởi tạo *
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mặc định là Staff@123"
                    required
                  />
                </label>
              )}
              {editMode && (
                <label>
                  Trạng thái hoạt động *
                  <select value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")}>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Đang bị khóa / Ngừng việc</option>
                  </select>
                </label>
              )}
            </div>
            <div className="buttons-group" style={{ marginTop: "16px" }}>
              <button type="submit" className="button login-button" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu lại"}
              </button>
              <button type="button" className="button" onClick={() => setShowForm(false)}>
                Hủy
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="card">
        <h2>Danh sách tài khoản hệ thống</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="products-table" style={{ width: "100%", fontSize: "14px" }}>
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const roleLabel = roles.find((r) => r.value === u.roleName)?.label || u.roleName;
                const createdDate = new Date(u.createdAt).toLocaleDateString("vi-VN");
                return (
                  <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.5 }}>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.fullName}</td>
                    <td>{u.email || "N/A"}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "12px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#E0F2FE",
                          color: "#0369A1",
                          fontWeight: "bold",
                        }}
                      >
                        {roleLabel}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "12px",
                          color: u.isActive ? "#10B981" : "#EF4444",
                          fontWeight: "bold",
                        }}
                      >
                        {u.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td>{createdDate}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="button"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => handleOpenEdit(u)}
                        >
                          Sửa
                        </button>
                        <button
                          className="button"
                          style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#F59E0B" }}
                          onClick={() => handleResetPassword(u)}
                        >
                          Reset Pass
                        </button>
                        <button
                          className="button"
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            backgroundColor: u.isActive ? "#EF4444" : "#10B981",
                          }}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.isActive ? "Khóa" : "Mở"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
