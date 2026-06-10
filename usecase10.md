# Use Case 10: Thanh toán online

## Mã Use Case

UC-12

## Tên

Thanh toán online

## Diễn giải

Khách hàng xác nhận thông tin thanh toán, chọn phương thức thanh toán (ví điện tử, chuyển khoản), thực hiện giao dịch và nhận xác nhận.

## Diễn viên chính

- Khách hàng (Customer)

## Các diễn viên phụ

- Hệ thống thanh toán
- Cổng thanh toán trực tuyến
- Hệ thống ví điện tử
- Hệ thống quản lý đơn hàng
- Hệ thống gửi email

## Điều kiện tiên quyết

- Khách hàng đã hoàn thành bước đặt hàng online (UC-11).
- Khách hàng có thông tin giao hàng hợp lệ.
- Phương thức thanh toán hiện có sẵn trên hệ thống.

## Điều kiện hậu yêu cầu

- Giao dịch thanh toán hoàn tất hoặc được ghi nhận trong hệ thống.
- Đơn hàng được xác nhận và tồn kho được cập nhật.
- Khách hàng nhận được email biên lai thanh toán.

## Luồng chính

1. Khách hàng xem màn hình xác nhận đơn hàng với tổng tiền cần thanh toán.
2. Hệ thống hiển thị danh sách phương thức thanh toán:
   - Thanh toán bằng ví điện tử (Momo, ZaloPay, ViettelMoney, v.v.)
   - Chuyển khoản ngân hàng (nếu hỗ trợ)
   - Thanh toán tại cửa hàng (COD - nếu hỗ trợ)
3. Khách hàng chọn phương thức thanh toán (VD: Thanh toán bằng Momo).
4. Hệ thống chuyển hướng khách tới trang ví điện tử (Momo):
   - Hiển thị thông tin giao dịch (số tiền, mã đơn)
   - Khách nhập thông tin ví / xác thực qua OTP
5. Ví điện tử xác nhận giao dịch.
6. Hệ thống nhận callback từ cổng thanh toán (payment gateway):
   - Nếu thành công: Cập nhật trạng thái đơn, giảm tồn kho, gửi email xác nhận
   - Nếu thất bại: Hiển thị thông báo lỗi, khách có thể thử lại hoặc chọn phương thức khác
7. Khách hàng nhìn thấy màn hình `Thanh toán thành công`:
   - Mã đơn
   - Chi tiết thanh toán
   - Nút in hoá đơn
   - Nút theo dõi giao hàng
8. Hệ thống gửi email xác nhận thanh toán chứa:
   - Chi tiết đơn hàng
   - Phương thức vận chuyển
   - Thời gian dự kiến giao
   - Link theo dõi giao hàng

## Luồng phụ / ngoại lệ

- **Trường hợp thanh toán thất bại**:
  1. Hệ thống hiển thị lỗi: "Giao dịch không thành công"
  2. Khách hàng chọn `Thử lại` hoặc `Chọn phương thức khác`
  3. Quay lại bước 3 hoặc 2

- **Trường hợp thanh toán pending** (chưa xác nhận):
  1. Hệ thống ghi nhận giao dịch chưa hoàn tất
  2. Gửi email cho khách để kiểm tra trạng thái
  3. Admin có thể xác nhận/hủy giao dịch này

- **Trường hợp chuyển khoản**:
  1. Khách chọn "Chuyển khoản ngân hàng"
  2. Hệ thống hiển thị thông tin tài khoản:
     - Chủ tài khoản: Công ty ABC
     - Số tài khoản: 123456789
     - Ngân hàng: Vietcombank
     - Số tiền: 5,000,000 VND
     - Nội dung: "Thanh toán đơn hàng ORD-123456"
  3. Khách chuyển khoản qua app ngân hàng
  4. Admin xác nhận giao dịch trong hệ thống
  5. Gửi email xác nhận cho khách

- **Trường hợp thanh toán tại cửa hàng (COD)**:
  1. Khách chọn "Thanh toán tại cửa hàng"
  2. Hệ thống tạo đơn với trạng thái "Chưa thanh toán"
  3. Khách nhận hàng và thanh toán tại quầy
  4. Nhân viên cập nhật trạng thái "Đã thanh toán" trong hệ thống

- **Xử lý lỗi kết nối**:
  - Nếu mất kết nối khi thanh toán, hệ thống lưu trạng thái và thử kết nối lại
  - Khách được hướng dẫn kiểm tra email xác nhận

## Yêu cầu phi chức năng liên quan

- Thanh toán phải được xử lý an toàn: HTTPS, PCI-DSS compliance.
- Mã hóa dữ liệu thanh toán (không lưu trữ trực tiếp CVV, PIN).
- Thời gian xử lý thanh toán < 5 giây.
- Hỗ trợ retry logic cho giao dịch thất bại.
- Tất cả giao dịch phải được audit log.
- Rate limiting để chống fraud.

## Ghi chú

- Không nên lưu lịch sử thanh toán đầy đủ (PCI compliance).
- Tích hợp anti-fraud system để phát hiện giao dịch đáng ngờ.
- Hỗ trợ refund/hoàn tiền nếu khách yêu cầu.
- Có thể tích hợp thêm phương thức thanh toán khác trong tương lai (Apple Pay, Google Pay).
