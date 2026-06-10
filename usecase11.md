# Use Case 11: Theo dõi đơn hàng online

## Mã Use Case

UC-13

## Tên

Theo dõi đơn hàng online

## Diễn giải

Khách hàng xem danh sách đơn hàng cá nhân, chi tiết đơn, theo dõi trạng thái giao hàng, và nhận thông báo cập nhật.

## Diễn viên chính

- Khách hàng (Customer)

## Các diễn viên phụ

- Hệ thống quản lý đơn hàng
- Hệ thống giao hàng / vận chuyển
- Hệ thống thông báo
- Hệ thống email

## Điều kiện tiên quyết

- Khách hàng đã đăng nhập vào tài khoản.
- Khách hàng đã có ít nhất 1 đơn hàng trong hệ thống.

## Điều kiện hậu yêu cầu

- Khách hàng xem được danh sách đơn hàng chính xác.
- Trạng thái giao hàng hiển thị real-time.
- Khách hàng nhận được thông báo kịp thời khi có cập nhật.

## Luồng chính

1. Khách hàng đăng nhập và truy cập trang `Đơn hàng của tôi` hoặc `Lịch sử mua hàng`.
2. Hệ thống hiển thị danh sách các đơn hàng của khách:
   - Mã đơn
   - Ngày đặt hàng
   - Tổng tiền
   - Trạng thái: Chờ xác nhận, Đã xác nhận, Đang giao, Đã giao, Hủy, Trả hàng
   - Phương thức thanh toán
3. Khách hàng chọn 1 đơn để xem chi tiết.
4. Hệ thống hiển thị thông tin đơn:
   - Mã đơn
   - Ngày đặt hàng
   - Danh sách sản phẩm (tên, số lượng, giá)
   - Tổng tiền, phí vận chuyển, voucher áp dụng
   - Tổng thanh toán
   - Trạng thái thanh toán
5. Khách hàng xem thông tin giao hàng:
   - Người nhận
   - Địa chỉ giao hàng
   - Số điện thoại
   - Phương thức vận chuyển
6. Khách hàng xem timeline giao hàng:
   - Đơn hàng đã xác nhận (ngày/giờ)
   - Đơn hàng đang chuẩn bị (ngày/giờ)
   - Đơn hàng đã giao vận chuyển (ngày/giờ)
   - Số vận đơn (tracking number)
   - Link theo dõi vận chuyển (nếu có)
7. Khách hàng có thể nhấn `Xem chi tiết giao hàng` để xem vị trí hàng thực tế (nếu cổng vận chuyển hỗ trợ).

## Luồng phụ / ngoại lệ

- **Lọc đơn hàng theo trạng thái**:
  1. Khách chọn lọc: Tất cả, Chờ xác nhận, Đang giao, Đã giao, Hủy
  2. Hệ thống hiển thị danh sách lọc

- **Tìm kiếm đơn hàng**:
  1. Khách nhập mã đơn hoặc tên sản phẩm
  2. Hệ thống hiển thị kết quả tìm kiếm

- **Trường hợp đơn hàng bị hủy**:
  1. Hệ thống hiển thị lý do hủy (nếu có)
  2. Hiển thị thông tin hoàn tiền
  3. Ngày hoàn tiền dự kiến

- **Yêu cầu trả hàng / hoàn tiền**:
  1. Khách nhấn nút `Yêu cầu trả hàng`
  2. Chuyển sang UC-08 (Hoàn tiền / Trả hàng)

- **In hoá đơn**:
  1. Khách nhấn nút `In hoá đơn`
  2. Hệ thống mở trang in hoặc download PDF hoá đơn

- **Liên hệ hỗ trợ**:
  1. Khách nhấn nút `Liên hệ hỗ trợ`
  2. Mở form liên hệ hoặc live chat

- **Thông báo cập nhật trạng thái**:
  1. Hệ thống tự động gửi email/SMS khi trạng thái đơn thay đổi
  2. Khách có thể xem thông báo trong hệ thống (notification center)

## Yêu cầu phi chức năng liên quan

- Danh sách đơn hàng phải tải nhanh, hỗ trợ pagination.
- Thông tin giao hàng phải cập nhật real-time (< 1 phút).
- Giao diện phải responsive trên mobile (khách thường kiểm tra điện thoại).
- Email thông báo phải gửi trong vòng 5 phút khi có cập nhật.
- Hỗ trợ in hoá đơn dạng PDF đẹp, chứa QR code.

## Ghi chú

- Hệ thống nên hiển thị "Giao hàng dự kiến trong X ngày" dựa trên phương thức vận chuyển.
- Khách có thể nhận cảnh báo SMS/email nếu giao hàng bị delay.
- Hiển thị số điện thoại người giao để khách liên hệ nếu cần.
- Hỗ trợ tích hợp real-time tracking từ cổng vận chuyển (nếu có API).
