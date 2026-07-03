# Hướng dẫn sử dụng ứng dụng Mobile Computer Store

## 1. Yêu cầu hệ thống

- Cài đặt Flutter SDK
- Cài đặt Android Studio hoặc VS Code + emulator/device
- Backend đang chạy trước khi dùng app

## 2. Cấu hình kết nối backend

Ứng dụng mobile đang gọi backend tại:

- http://10.0.2.2:5000

Nếu chạy trên thiết bị thật, hãy đổi địa chỉ API trong file:

- mobile/lib/services/api_service.dart

## 3. Cài đặt và chạy app

1. Mở terminal tại thư mục mobile
2. Chạy lệnh:
   ```bash
   flutter pub get
   flutter run
   ```
3. Chọn emulator hoặc thiết bị đã kết nối

## 4. Đăng nhập

- Tên đăng nhập mẫu: admin
- Mật khẩu mẫu: 123456

Sau khi đăng nhập thành công, bạn sẽ được chuyển vào màn hình chính của ứng dụng.

## 5. Các chức năng chính

### Sản phẩm

- Xem danh sách sản phẩm
- Tìm kiếm theo tên, mã hoặc hãng
- Xem chi tiết sản phẩm
- Tạo đơn hàng trực tiếp từ sản phẩm

### Đơn hàng

- Xem danh sách đơn hàng
- Tạo đơn hàng mới
- Theo dõi trạng thái đơn hàng

### Kho hàng

- Xem tồn kho sản phẩm
- Tăng/giảm số lượng tồn kho

### Voucher

- Xem danh sách voucher đang có
- Xem điều kiện và hạn sử dụng

### Báo cáo

- Xem báo cáo doanh thu
- Xem thống kê tồn kho

## 6. Lưu ý

- Nếu app không kết nối được backend, hãy kiểm tra:
  - Backend có đang chạy không
  - Cổng 5000 có mở không
  - Địa chỉ API có đúng không

## 7. Đăng xuất

- Nhấn biểu tượng đăng xuất ở góc trên bên phải màn hình chính

Nếu cần, bạn có thể tiếp tục mở rộng app thêm các tính năng như giỏ hàng, thanh toán, hoặc thông báo đơn hàng.
