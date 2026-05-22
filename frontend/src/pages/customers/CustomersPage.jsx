import { useEffect, useState } from "react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/api/customers.api";
import { Button } from "@/components/ui/button";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

export default function CustomersPage({ token }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetchCustomers(token);
      setCustomers(response.data || []);
    } catch (error) {
      setMessage(error.message || "Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadCustomers();
  }, [token]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.name || !form.phone) {
      setMessage("Tên và số điện thoại là bắt buộc.");
      return;
    }

    try {
      const payload = { ...form };
      if (editingId) {
        await updateCustomer(editingId, payload, token);
        setMessage("Cập nhật khách hàng thành công.");
      } else {
        await createCustomer(payload, token);
        setMessage("Thêm khách hàng mới thành công.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadCustomers();
    } catch (error) {
      setMessage(error.message || "Lưu khách hàng thất bại.");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa khách hàng này?")) return;
    try {
      await deleteCustomer(id, token);
      setMessage("Xóa khách hàng thành công.");
      if (editingId === id) setEditingId(null);
      setForm(emptyForm);
      await loadCustomers();
    } catch (error) {
      setMessage(error.message || "Xóa khách hàng thất bại.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Quản lý khách hàng
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Thêm, sửa và xóa thông tin khách hàng.
            </p>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 mt-6"
        >
          {[
            { label: "Tên khách hàng", key: "name" },
            { label: "Số điện thoại", key: "phone" },
            { label: "Email", key: "email", type: "email" },
            { label: "Địa chỉ", key: "address" },
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-medium text-slate-700">
                {field.label}
              </span>
              <input
                type={field.type || "text"}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          ))}

          <div className="md:col-span-2 flex flex-wrap items-center gap-3 justify-end">
            {editingId ? (
              <>
                <Button type="submit">Cập nhật khách hàng</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setMessage("");
                  }}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <Button type="submit">Thêm khách hàng</Button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-4 text-xl font-semibold text-slate-900">
          Danh sách khách hàng
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Điện thoại</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Chưa có khách hàng nào.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3">{customer.phone}</td>
                    <td className="px-4 py-3">{customer.email || "-"}</td>
                    <td className="px-4 py-3">{customer.address || "-"}</td>
                    <td className="px-4 py-3 space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(customer)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
