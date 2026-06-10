# Use Case 8: Quản lý người dùng / Nhân viên

## Mã Use Case

UC-10

## Tên

Quản lý người dùng / Nhân viên

## Diễn giải

Người dùng Admin quản lý tài khoản nhân viên, bao gồm tạo mới, sửa, xóa, phân quyền vai trò, và xem lịch sử hoạt động.

## Diễn viên chính

- Admin

## Các diễn viên phụ

- Hệ thống xác thực
- Cơ sở dữ liệu người dùng
- Hệ thống audit log

## Điều kiện tiên quyết

- Người dùng đã đăng nhập với vai trò Admin.
- Nhân viên mới có thông tin bắt buộc: tên, tài khoản, email.

## Điều kiện hậu yêu cầu

- Tài khoản nhân viên được tạo và có thể đăng nhập ngay.
- Vai trò và quyền hạn được áp dụng chính xác.
- Lịch sử hoạt động nhân viên được ghi nhận để audit.

## Luồng chính

1. Admin vào trang `Quản lý người dùng`.
2. Hệ thống hiển thị danh sách nhân viên hiện tại.
3. Admin chọn `Tạo tài khoản mới`.
4. Admin nhập thông tin nhân viên:
   - Tên đầy đủ
   - Tài khoản (username)
   - Email
   - Số điện thoại
   - Vai trò: Admin, Sales, Accountant, Warehouse
   - Trạng thái: Hoạt động / Vô hiệu hóa
   - Ghi chú
5. Hệ thống tự động tạo mật khẩu tạm thời hoặc Admin nhập mật khẩu.
6. Admin nhấn `Tạo tài khoản`.
7. Hệ thống lưu tài khoản và gửi email xác nhận cho nhân viên (có mật khẩu tạm).
8. Hệ thống hiển thị thông báo thành công.

## Luồng phụ / ngoại lệ

- Nếu tài khoản hoặc email đã tồn tại, hệ thống thông báo trùng lặp.
- Nếu thông tin nhập thiếu, hệ thống hiển thị lỗi.
- Admin chọn nhân viên và nhấn `Sửa`:
  - Cập nhật tên, email, số điện thoại
  - Thay đổi vai trò (admin, sales, accountant, warehouse)
  - Thay đổi trạng thái (hoạt động / vô hiệu hóa)
  - Cấp quyền cụ thể thêm (nếu cần)
- Admin chọn nhân viên và nhấn `Reset mật khẩu`:
  - Hệ thống tạo mật khẩu tạm hoặc gửi link reset
  - Gửi email hướng dẫn
- Admin chọn nhân viên và nhấn `Xóa`:
  - Soft delete tài khoản (đánh dấu vô hiệu hóa)
  - Giữ lịch sử hoạt động cho audit
- Admin chọn nhân viên để xem `Chi tiết hoạt động`:
  - Lần đăng nhập gần nhất
  - Số lần đăng nhập
  - Các hành động quan trọng đã thực hiện
  - IP address cuối cùng đăng nhập
- Lọc nhân viên theo:
  - Vai trò
  - Trạng thái (hoạt động / vô hiệu hóa)
  - Ngày tạo tài khoản
  - Phòng ban / khu vực (nếu có)
- Tìm kiếm nhân viên theo tên, tài khoản, email

## Yêu cầu phi chức năng liên quan

- Tạo tài khoản phải mạnh mẽ và an toàn (mật khẩu mạnh, xác thực 2 lớp).
- Danh sách nhân viên phải tải nhanh, hỗ trợ pagination.
- Mật khẩu nhân viên phải được mã hóa bcrypt hoặc tương đương.
- Ghi log tất cả hành động tạo/sửa/xóa tài khoản cho audit.
- Hỗ trợ export danh sách nhân viên dạng Excel.

## Ghi chú

- Admin nên cảnh báo khi tài khoản có hoạt động đáng ngờ.
- Hệ thống nên tự động vô hiệu hóa tài khoản sau khoảng thời gian không hoạt động.
- Phân quyền chi tiết có thể được cấu hình cho mỗi vai trò thông qua một giao diện riêng.
- Lịch sử hoạt động nhân viên giúp admin theo dõi công việc của nhân viên (nếu cần).
