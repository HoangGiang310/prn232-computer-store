import React, { useState } from "react";
import { useCartStore } from "../../store/cartStore";

export default function POSPage() {
  const {
    cartItems,
    discount,
    payMethod,
    addToCart,
    removeFromCart,
    setDiscount,
    setPayMethod,
    clearCart,
  } = useCartStore();
  const [scanSerial, setScanSerial] = useState("");

  // Giả lập quét mã vạch / Tìm kiếm sản phẩm nhanh từ Serial Kho
  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scanSerial) return;

    // Giả lập dữ liệu trả về từ API
    const mockProduct = {
      id: "prod-1122",
      name: "Laptop ASUS ROG Strix G16",
      price: 32990000,
      brand: "ASUS",
    };

    addToCart(mockProduct, scanSerial);
    setScanSerial("");
  };

  const totalBill =
    cartItems.reduce((acc, item) => acc + item.price, 0) - discount;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("Giỏ hàng đang trống!");

    // Gửi dữ liệu Checkout lên Backend API
    alert(
      `🎉 Thanh toán thành công hóa đơn! Tổng tiền: ${totalBill.toLocaleString()} đ`,
    );
    clearCart();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-screen bg-slate-100">
      {/* Cột trái: Quét mã & Danh sách hàng chờ xuất */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            🖥️ Quầy Bán Hàng Máy Tính - POS
          </h2>

          <form onSubmit={handleScanSubmit} className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Quét mã vạch Serial máy hoặc nhập tay:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanSerial}
                onChange={(e) => setScanSerial(e.target.value)}
                placeholder="Ví dụ: SN-ASUS-99882..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Thêm máy
              </button>
            </div>
          </form>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-slate-600 text-sm uppercase">
                  <th className="p-3">Sản phẩm Laptop</th>
                  <th className="p-3">Số Serial máy</th>
                  <th className="p-3 text-right">Đơn giá</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    <td className="p-3 font-medium text-slate-800">
                      {item.name}
                    </td>
                    <td className="p-3 text-sm text-blue-600 font-mono font-bold">
                      {item.serialCode}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {item.price.toLocaleString()} đ
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeFromCart(item.serialCode)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {cartItems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-slate-400">
                      Chưa có máy nào được quét vào giỏ hàng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cột phải: Tính tiền & Phương thức thanh toán */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
            💳 Thông Tin Thanh Toán
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền máy ({cartItems.length} chiếc):</span>
              <span className="font-semibold text-slate-800">
                {cartItems
                  .reduce((acc, item) => acc + item.price, 0)
                  .toLocaleString()}{" "}
                đ
              </span>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">
                Chiết khấu hệ thống (đ):
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-blue-500 text-right font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">
                Hình thức thanh toán:
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                <option value="CASH">💵 Tiền mặt tại quầy</option>
                <option value="BANK_TRANSFER">🏦 Chuyển khoản ngân hàng</option>
                <option value="VNPAY">📲 Cổng thanh toán VNPay</option>
                <option value="MOMO">🔮 Ví điện tử MoMo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-4">
          <div className="flex justify-between items-baseline mb-6">
            <span className="text-lg font-bold text-slate-700">
              Khách cần trả:
            </span>
            <span className="text-3xl font-black text-emerald-600">
              {totalBill.toLocaleString()} đ
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl text-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition duration-150"
          >
            XUẤT HÓA ĐƠN & IN 🧾
          </button>
        </div>
      </div>
    </div>
  );
}
