# Use Case 3: Quản lý đơn hàng

## Mã Use Case

UC-03

## Tên

Quản lý đơn hàng

## Diễn giải

Người dùng tạo và xử lý đơn hàng, bao gồm đơn online và đơn offline, quản lý chi tiết đơn, thanh toán và theo dõi trạng thái giao hàng.

## Diễn viên chính

- Nhân viên bán hàng
- Khách hàng
- Admin

## Các diễn viên phụ

- Hệ thống đơn hàng
- Hệ thống kho
- Hệ thống thanh toán

## Điều kiện tiên quyết

- Người dùng đã đăng nhập với vai trò phù hợp.
- Sản phẩm tồn kho đủ để tạo đơn.
- Nếu là đơn online, khách hàng đã cung cấp thông tin giao hàng và phương thức thanh toán.

## Điều kiện hậu yêu cầu

- Đơn hàng được tạo và lưu trữ đầy đủ thông tin.
- Tồn kho tự động cập nhật đúng theo số lượng sản phẩm đã bán.
- Trạng thái đơn hiển thị chính xác: mới, xác nhận, đang giao, đã giao, hủy, hoàn trả.

## Luồng chính

1. Người dùng chọn kênh tạo đơn: online hoặc offline.
2. Người dùng chọn sản phẩm và số lượng.
3. Hệ thống kiểm tra tồn kho và hiển thị cảnh báo nếu không đủ.
4. Người dùng nhập thông tin khách hàng (với đơn online) hoặc chọn khách hàng có sẵn.
5. Người dùng chọn phương thức thanh toán và vận chuyển.
6. Người dùng nhấn `Xác nhận đơn`.
7. Hệ thống lưu đơn hàng, cập nhật tồn kho và tạo phiếu giao hàng nếu cần.
8. Hệ thống gửi thông báo trạng thái hoặc cập nhật trang quản lý đơn.

## Luồng phụ / ngoại lệ

- Nếu số lượng chọn lớn hơn tồn kho, hệ thống hiển thị lỗi và không cho phép tiếp tục.
- Nếu khách hàng muốn áp dụng voucher, hệ thống kiểm tra điều kiện và cập nhật giá.
- Nếu đơn bị hủy, hệ thống cập nhật trạng thái và khôi phục tồn kho.
- Nếu đơn yêu cầu trả hàng hoặc hoàn tiền, hệ thống tạo yêu cầu trả hàng và xử lý thông tin hoàn.

## Yêu cầu phi chức năng liên quan

- Việc tạo đơn phải nhanh và đảm bảo tính toàn vẹn dữ liệu.
- Hệ thống phải hỗ trợ đồng bộ tồn kho theo thời gian thực.
- Thông tin đơn hàng và giao dịch phải được bảo mật.
- Giao diện quản lý đơn cần hiển thị rõ trạng thái và hành động.

## Ghi chú

- Đơn online và offline đều được ghi nhận trong một hệ thống chung.
- Hệ thống cần phân biệt kênh bán hàng để báo cáo và quản lý.
