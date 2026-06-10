# Use Case 5: Quản lý khách hàng

## Mã Use Case

UC-06

## Tên

Quản lý khách hàng

## Diễn giải

Người dùng Admin hoặc Nhân viên bán hàng quản lý thông tin khách hàng, bao gồm thêm mới, sửa, xóa, tìm kiếm và xem lịch sử mua hàng.

## Diễn viên chính

- Admin
- Nhân viên bán hàng

## Các diễn viên phụ

- Hệ thống quản lý khách hàng
- Cơ sở dữ liệu khách hàng
- Hệ thống đơn hàng

## Điều kiện tiên quyết

- Người dùng đã đăng nhập và có quyền truy cập chức năng quản lý khách hàng.
- Khách hàng mới có thông tin bắt buộc: tên, số điện thoại, email (tùy chọn).

## Điều kiện hậu yêu cầu

- Thông tin khách hàng được lưu trữ chính xác và có thể truy cập bất cứ lúc nào.
- Lịch sử mua hàng của khách được liên kết với các đơn hàng tương ứng.
- Ghi chú nội bộ về khách được lưu an toàn.

## Luồng chính

1. Người dùng vào trang quản lý khách hàng.
2. Hệ thống hiển thị danh sách khách hàng và công cụ tìm kiếm, lọc.
3. Người dùng chọn thao tác `Thêm khách hàng mới`.
4. Người dùng nhập thông tin khách: tên, số điện thoại, email, địa chỉ, ghi chú.
5. Người dùng nhấn nút `Lưu`.
6. Hệ thống xác thực dữ liệu và lưu khách hàng mới vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo thành công và cập nhật danh sách khách hàng.

## Luồng phụ / ngoại lệ

- Nếu thông tin nhập thiếu hoặc không hợp lệ, hệ thống hiển thị lỗi.
- Người dùng có thể tìm kiếm khách hàng theo tên, số điện thoại, email.
- Người dùng chọn khách hàng và nhấn `Sửa` để cập nhật thông tin.
- Người dùng chọn khách hàng và nhấn `Xóa` để xóa khách khỏi hệ thống (soft delete).
- Người dùng chọn khách hàng để xem `Lịch sử mua hàng` - danh sách các đơn đã tạo cho khách này.
- Người dùng có thể thêm `Ghi chú nội bộ` cho khách (chỉ nhân viên thấy).
- Lọc khách hàng theo ngày tạo, ngày mua gần nhất, số lần mua.

## Yêu cầu phi chức năng liên quan

- Danh sách khách hàng phải tải nhanh, hỗ trợ pagination.
- Tìm kiếm khách phải phản hồi nhanh (< 1 giây).
- Dữ liệu khách phải được bảo mật (GDPR compliance).
- Hỗ trợ import/export danh sách khách từ Excel.

## Ghi chú

- Khách hàng có thể là khách mua 1 lần hoặc khách thường xuyên.
- Ghi chú nội bộ không hiển thị cho khách hàng.
- Khi xóa khách, hệ thống vẫn giữ lại lịch sử đơn hàng liên quan.
