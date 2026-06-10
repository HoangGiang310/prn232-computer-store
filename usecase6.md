# Use Case 6: Quản lý khuyến mãi và Voucher

## Mã Use Case

UC-07

## Tên

Quản lý khuyến mãi và Voucher

## Diễn giải

Người dùng Admin tạo và quản lý chương trình khuyến mãi, mã voucher, mã giảm giá, bao gồm thiết lập điều kiện áp dụng, thời hạn, và theo dõi sử dụng.

## Diễn viên chính

- Admin

## Các diễn viên phụ

- Hệ thống quản lý voucher
- Cơ sở dữ liệu khuyến mãi
- Hệ thống đơn hàng
- Hệ thống bán hàng (POS)

## Điều kiện tiên quyết

- Người dùng đã đăng nhập với vai trò Admin.
- Voucher/mã giảm giá có thông tin bắt buộc: mã, giá trị, điều kiện áp dụng, thời hạn.

## Điều kiện hậu yêu cầu

- Mã voucher được lưu trữ và có thể áp dụng trên hệ thống bán hàng.
- Khách hàng có thể sử dụng mã voucher khi đặt hàng online hoặc offline.
- Hệ thống tự động kiểm tra điều kiện áp dụng và cập nhật giá.

## Luồng chính

1. Người dùng (Admin) vào trang quản lý voucher.
2. Hệ thống hiển thị danh sách voucher hiện tại.
3. Người dùng chọn `Tạo voucher mới`.
4. Người dùng nhập thông tin voucher:
   - Mã voucher (VD: SUMMER20, SAVE100)
   - Loại: Phần trăm giảm (%) hoặc số tiền giảm (VND)
   - Giá trị giảm (VD: 20% hoặc 100,000 VND)
   - Giá trị đơn tối thiểu (nếu có)
   - Số lần sử dụng tối đa
   - Thời hạn (từ ngày - đến ngày)
   - Sản phẩm áp dụng (tất cả hoặc sản phẩm cụ thể)
   - Ghi chú
5. Người dùng nhấn `Lưu`.
6. Hệ thống xác thực dữ liệu và lưu voucher.
7. Hệ thống hiển thị thông báo thành công.

## Luồng phụ / ngoại lệ

- Nếu mã voucher đã tồn tại, hệ thống thông báo trùng lặp.
- Nếu thông tin nhập thiếu, hệ thống hiển thị lỗi.
- Người dùng chọn voucher và nhấn `Sửa` để cập nhật thông tin (chỉ có thể sửa nếu voucher chưa được sử dụng).
- Người dùng chọn voucher và nhấn `Vô hiệu hóa` để ngừng sử dụng (không xóa, giữ lại cho audit).
- Người dùng chọn voucher để xem `Thống kê sử dụng`:
  - Số lần đã sử dụng
  - Ngày sử dụng gần nhất
  - Khách đã sử dụng
  - Tổng tiền giảm đã cấp
- Lọc voucher theo trạng thái: hoạt động, hết hạn, vô hiệu hóa.
- Tìm kiếm voucher theo mã.

## Yêu cầu phi chức năng liên quan

- Kiểm tra điều kiện voucher nhanh chóng khi khách áp dụng (< 500ms).
- Danh sách voucher phải tải nhanh và hỗ trợ pagination.
- Dữ liệu voucher phải được bảo mật (không hiển thị công khai).
- Hỗ trợ export danh sách voucher và thống kê sử dụng.

## Ghi chú

- Voucher có thể áp dụng cho cả đơn online và offline.
- Voucher có thể kết hợp với chiết khấu khác (tùy chính sách).
- Hệ thống nên ngăn chặn sử dụng voucher vượt quá số lần cho phép.
- Hệ thống cần cảnh báo khi voucher sắp hết hạn.
