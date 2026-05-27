# Use Case 1: Đăng nhập hệ thống

## Mã Use Case

UC-01

## Tên

Đăng nhập / đăng xuất

## Diễn giải

Người dùng (quản trị viên, nhân viên, kế toán, quản lý kho) đăng nhập vào hệ thống bằng tài khoản và mật khẩu, sau đó thoát khỏi hệ thống khi kết thúc phiên làm việc.

## Diễn viên chính

- Nhân viên bán hàng
- Quản trị viên
- Kế toán
- Quản lý kho

## Các diễn viên phụ

- Hệ thống xác thực
- Cơ sở dữ liệu người dùng

## Điều kiện tiên quyết

- Người dùng đã có tài khoản hợp lệ trong hệ thống.
- Người dùng truy cập được màn hình đăng nhập.

## Điều kiện hậu yêu cầu

- Người dùng được chuyển đến trang quản lý phù hợp với vai trò của mình.
- Phiên làm việc được tạo và lưu trữ an toàn.
- Người dùng không thể truy cập khi chưa đăng nhập.

## Luồng chính

1. Người dùng mở trang đăng nhập.
2. Người dùng nhập tên đăng nhập và mật khẩu.
3. Người dùng nhấn nút `Đăng nhập`.
4. Hệ thống xác thực thông tin với cơ sở dữ liệu.
5. Nếu thông tin chính xác, hệ thống mở phiên người dùng và chuyển đến trang chính phù hợp với vai trò.
6. Người dùng tương tác với hệ thống theo quyền hạn của vai trò.

## Luồng phụ / ngoại lệ

- Nếu tên đăng nhập hoặc mật khẩu không đúng, hệ thống hiển thị thông báo lỗi.
- Nếu tài khoản bị khóa hoặc hết hạn, hệ thống thông báo trạng thái tài khoản.
- Nếu người dùng quên mật khẩu, hệ thống hướng dẫn thao tác lấy lại mật khẩu (nếu chức năng này được triển khai).

## Luồng đăng xuất

1. Người dùng chọn chức năng `Đăng xuất`.
2. Hệ thống hủy phiên làm việc hiện tại và xóa dữ liệu phiên tạm.
3. Hệ thống chuyển người dùng về trang đăng nhập.

## Yêu cầu phi chức năng liên quan

- Mật khẩu phải được mã hóa trước khi lưu trữ.
- Phiên làm việc phải được quản lý an toàn để tránh truy cập trái phép.
- Giao diện đăng nhập cần đơn giản, rõ ràng và hỗ trợ hiển thị thông báo lỗi.

## Ghi chú

- Hệ thống phân quyền theo vai trò: admin, nhân viên, kế toán, quản lý kho.
- Mỗi vai trò sẽ được điều hướng tới trang hoặc chức năng phù hợp sau khi đăng nhập thành công.
