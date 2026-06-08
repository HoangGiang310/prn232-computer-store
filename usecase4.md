# Use Case 4: Quản lý kho và vận chuyển

## Mã Use Case

UC-04

## Tên

Quản lý kho và vận chuyển

## Diễn giải

Người quản lý kho theo dõi tồn kho, điều chỉnh nhập xuất, nhận cảnh báo khi thiếu hàng và cập nhật trạng thái giao hàng cho đơn.

## Diễn viên chính

- Quản lý kho
- Nhân viên bán hàng
- Nhân viên vận chuyển

## Các diễn viên phụ

- Hệ thống kho
- Hệ thống đơn hàng
- Hệ thống thông báo

## Điều kiện tiên quyết

- Người dùng đã đăng nhập với vai trò kho hoặc nhân viên có quyền truy cập.
- Sản phẩm có tồn kho được ghi nhận trong hệ thống.
- Đơn hàng đã được xác nhận cần xử lý kho và giao hàng.

## Điều kiện hậu yêu cầu

- Tồn kho được cập nhật chính xác sau mỗi nhập, xuất hoặc trả hàng.
- Lịch sử điều chỉnh kho được lưu lại đầy đủ.
- Trạng thái vận chuyển đơn hàng được cập nhật và khách hàng có thể theo dõi.

## Luồng chính

1. Người dùng vào trang quản lý kho.
2. Hệ thống hiển thị danh sách sản phẩm và số lượng tồn kho hiện tại.
3. Người dùng xem cảnh báo các sản phẩm gần hết hàng.
4. Người dùng chọn thao tác `Nhập kho` hoặc `Xuất kho`.
5. Người dùng nhập thông tin điều chỉnh: số lượng, lý do, kho liên quan.
6. Hệ thống cập nhật tồn kho và lưu lịch sử điều chỉnh.
7. Nếu có đơn hàng cần giao, người dùng cập nhật trạng thái vận chuyển (đang chuyển, đã giao, gặp sự cố).
8. Hệ thống đồng bộ thông tin với đơn hàng và cập nhật trạng thái giao hàng.

## Luồng phụ / ngoại lệ

- Nếu điều chỉnh kho đưa số lượng về âm, hệ thống từ chối thao tác và báo lỗi.
- Nếu đơn bị hủy trước khi xuất kho, hệ thống phục hồi lại tồn kho.
- Nếu trạng thái vận chuyển được cập nhật sai, người dùng có thể sửa lại thông tin vận đơn.
- Nếu sản phẩm thiếu hàng, hệ thống hiển thị cảnh báo và đề xuất đặt nhập lại.

## Yêu cầu phi chức năng liên quan

- Hệ thống phải xử lý cảnh báo tồn kho nhanh và chính xác.
- Lịch sử điều chỉnh kho phải dễ tra cứu và bảo mật.
- Cập nhật trạng thái vận chuyển phải đồng bộ với đơn hàng.
- Giao diện kho phải rõ ràng, cho phép lọc theo trạng thái và sản phẩm.

## Ghi chú

- Hệ thống nên hỗ trợ cảnh báo thiếu hàng theo ngưỡng do quản trị viên thiết lập.
- Việc trả hàng/hoàn tiền cần tự động điều chỉnh tồn kho khi hàng về.
