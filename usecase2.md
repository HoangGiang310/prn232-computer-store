# Use Case 2: Quản lý sản phẩm

## Mã Use Case

UC-02

## Tên

Quản lý sản phẩm

## Diễn giải

Người dùng có vai trò Admin hoặc Nhân viên quản lý thông tin sản phẩm, bao gồm tạo mới, sửa, xóa, tìm kiếm, lọc và xem chi tiết sản phẩm.

## Diễn viên chính

- Admin
- Nhân viên bán hàng

## Các diễn viên phụ

- Hệ thống quản lý sản phẩm
- Cơ sở dữ liệu sản phẩm

## Điều kiện tiên quyết

- Người dùng đã đăng nhập và có quyền truy cập chức năng quản lý sản phẩm.
- Sản phẩm mới có thông tin bắt buộc: tên, mã sản phẩm, hãng, cấu hình, giá bán, giá nhập, số lượng tồn kho.

## Điều kiện hậu yêu cầu

- Thông tin sản phẩm được lưu trữ hoặc cập nhật chính xác trong hệ thống.
- Danh sách sản phẩm hiện tại phản ánh đúng trạng thái tồn kho và giá bán.
- Hệ thống lưu trữ lịch sử thao tác khi có thay đổi dữ liệu sản phẩm.

## Luồng chính

1. Người dùng vào trang quản lý sản phẩm.
2. Hệ thống hiển thị danh sách sản phẩm và công cụ tìm kiếm, lọc.
3. Người dùng chọn thao tác `Thêm sản phẩm`.
4. Người dùng nhập đầy đủ thông tin sản phẩm và tải lên hình ảnh nếu cần.
5. Người dùng nhấn nút `Lưu`.
6. Hệ thống xác thực dữ liệu và lưu sản phẩm mới vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo thành công và cập nhật danh sách sản phẩm.

## Luồng phụ / ngoại lệ

- Nếu thông tin nhập thiếu hoặc không hợp lệ, hệ thống hiển thị lỗi và yêu cầu sửa.
- Nếu mã sản phẩm đã tồn tại, hệ thống thông báo trùng lặp.
- Người dùng có thể tìm kiếm sản phẩm theo tên, mã, hãng, giá hoặc trạng thái kho.
- Người dùng có thể lọc danh sách theo hãng, mức giá, và tình trạng tồn kho.
- Người dùng chọn sản phẩm và nhấn `Sửa` để cập nhật thông tin.
- Người dùng chọn sản phẩm và nhấn `Xóa` để xoá sản phẩm khỏi hệ thống.

## Yêu cầu phi chức năng liên quan

- Danh sách sản phẩm hiển thị nhanh, luôn phản ánh trạng thái tồn kho mới nhất.
- Upload ảnh sản phẩm phải hỗ trợ nhiều hình và hiển thị thumbnail.
- Giao diện dễ dùng, trực quan cho việc tìm kiếm và quản lý số lượng sản phẩm.
- Dữ liệu sản phẩm phải được lưu trữ an toàn và có khả năng khôi phục.

## Ghi chú

- Sản phẩm cần có thông số kỹ thuật đầy đủ khi xem chi tiết.
- Hệ thống nên hỗ trợ nhiều ảnh cho mỗi sản phẩm và hiển thị ảnh chính.
