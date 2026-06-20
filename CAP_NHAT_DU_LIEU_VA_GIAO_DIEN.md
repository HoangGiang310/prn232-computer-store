# Cập nhật: Thêm dữ liệu cửa hàng + Làm đẹp giao diện

## 1. Thêm dữ liệu sản phẩm cửa hàng máy tính (`backend/Services/DatabaseSeeder.cs`)

Trước đây chỉ có 2 sản phẩm với ảnh giả (`cdn.example.com`). Đã thay bằng **12 sản phẩm thật** kèm ảnh thật (nguồn Unsplash hiển thị đẹp):

- 10 laptop: Dell XPS 13, MacBook Air M3, MacBook Pro 16 M3 Pro, ASUS ROG Strix G16, ASUS Zenbook 14 OLED, Lenovo Legion Pro 5, ThinkPad X1 Carbon, HP Spectre x360, Acer Swift Go 14, MSI Katana 15.
- 2 phụ kiện: Chuột Logitech MX Master 3S, Bàn phím cơ Keychron K8 Pro.

Mỗi sản phẩm có mã, hãng, cấu hình chi tiết, giá nhập/bán, tồn kho, ngưỡng cảnh báo và **ảnh chính**.

Thêm **4 voucher**: `GIAMGIAMAYTINH`, `SINHVIEN10` (10%), `FREESHIP`, `BLACKFRIDAY` (5%).

> Lưu ý: dữ liệu chỉ được gieo khi bảng còn trống. Nếu database cũ đã có sản phẩm, hãy xóa database `computerstore` (hoặc bảng Products) rồi chạy lại backend để nạp bộ sản phẩm mới.

## 2. Giao diện đẹp & chỉn chu

### Lớp theme tổng thể (`frontend/styles/globals.css`)
- Bộ **design token** (màu thương hiệu indigo + cyan, bo góc, đổ bóng nhiều cấp).
- Nền gradient mềm toàn trang.
- Header card chuyển thành **banner gradient** nổi bật.
- Nút, ô nhập liệu, bảng, thẻ được bo tròn, có hiệu ứng hover/focus mượt.
- Thanh cuộn tùy biến, responsive cho mobile.

### Trang khách hàng (`customer.tsx`)
- Lưới sản phẩm dạng **card có ảnh**, badge hãng, nhãn tồn kho (còn/hết), giá nổi bật, hiệu ứng phóng ảnh khi hover.

### Trang chi tiết sản phẩm (`product/[id].tsx`)
- Thêm **khung ảnh lớn (gallery)** cạnh thông tin và giá.

### Trang chủ (`index.tsx`)
- Khu sản phẩm nổi bật giờ **lấy dữ liệu thật từ API** (kèm ảnh), thay cho dữ liệu cứng.

### Trang quản lý sản phẩm (`products.tsx`)
- Bảng có thêm **cột ảnh thumbnail**.

## 3. Kiểm thử
- Frontend: `next build` thành công (21 trang), TypeScript sạch lỗi — đã cài dependencies và build thật.
- Backend: rà soát thủ công (không có .NET SDK trong môi trường đóng gói); cú pháp cân bằng, 12 sản phẩm + 4 voucher.

## Chạy lại
```
cd backend && dotnet restore && dotnet run --urls "http://localhost:5000"
cd frontend && npm install && npm run dev   # mở http://localhost:3001
```
