import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { io } from "socket.io-client";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Sản phẩm", path: "/products" },
  { label: "Khách hàng", path: "/customers" },
  { label: "Đơn hàng", path: "/orders" },
  { label: "Quầy POS", path: "/pos" },
];

export default function Header({ token, onLogout }) {
  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
    );

    socket.on("new-order-alert", (data) => {
      alert(
        `🔔 THÔNG BÁO HỆ THỐNG:\n${data.message}\nSố tiền: ${data.total.toLocaleString()} VNĐ`,
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Computer Store Admin
          </h1>
          <p className="text-sm text-slate-500">
            Hệ thống quản lý bán hàng laptop - backend Node.js + React
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {token ? (
            <button
              onClick={onLogout}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
