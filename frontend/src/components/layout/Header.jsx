import React, { useEffect } from "react";
import { io } from "socket.io-client";

export default function Header() {
  useEffect(() => {
    // Kết nối đến luồng Socket máy chủ
    const socket = io("http://localhost:3000");

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
    <header
      style={{
        background: "#fff",
        padding: "10px 20px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h4>Hệ Thống ERP - Quản Lý Bán Hàng Laptop Toàn Diện v1.0</h4>
      <div>
        Trạng thái máy chủ:{" "}
        <span style={{ color: "green" }}>● Đang chạy trực tuyến</span>
      </div>
    </header>
  );
}
