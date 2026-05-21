import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000");

export default function RealtimeAlert() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    socket.on("new-order-alert", (data) => {
      setNotification(data);
      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => setNotification(null), 5000);
    });

    return () => socket.off("new-order-alert");
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 max-w-sm animate-bounce z-50">
      <div className="flex items-start gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg text-xl">💰</div>
        <div>
          <h4 className="font-bold text-emerald-400">Hệ thống đơn hàng mới!</h4>
          <p className="text-sm text-slate-300 mt-1">{notification.message}</p>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Doanh thu: +{notification.total.toLocaleString()} đ
          </p>
        </div>
      </div>
    </div>
  );
}
