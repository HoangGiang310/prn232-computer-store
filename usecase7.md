# Use Case 7: Báo cáo và Thống kê

## Mã Use Case

UC-09

## Tên

Báo cáo và Thống kê

## Diễn giải

Người dùng Admin hoặc Kế toán xem báo cáo doanh thu, lợi nhuận, thống kê sản phẩm, và xuất dữ liệu dạng Excel/CSV.

## Diễn viên chính

- Admin
- Kế toán

## Các diễn viên phụ

- Hệ thống báo cáo
- Cơ sở dữ liệu giao dịch
- Hệ thống đơn hàng
- Hệ thống sản phẩm

## Điều kiện tiên quyết

- Người dùng đã đăng nhập với vai trò Admin hoặc Kế toán.
- Dữ liệu đơn hàng, sản phẩm đã được ghi nhận trong hệ thống.

## Điều kiện hậu yêu cầu

- Báo cáo được tạo chính xác với dữ liệu từ cơ sở dữ liệu.
- Báo cáo có thể được xuất dạng PDF/Excel/CSV để phân tích thêm.
- Dữ liệu báo cáo hiển thị theo khoảng thời gian được chọn.

## Luồng chính

1. Người dùng vào trang `Báo cáo và Thống kê`.
2. Hệ thống hiển thị menu lựa chọn loại báo cáo:
   - Báo cáo doanh thu
   - Báo cáo lợi nhuận
   - Báo cáo sản phẩm
   - Báo cáo tài chính (cho Kế toán)
3. Người dùng chọn loại báo cáo `Doanh thu`.
4. Hệ thống hiển thị các tùy chọn lọc:
   - Khoảng thời gian (ngày, tuần, tháng, năm)
   - Kênh bán (Online, Offline, Tất cả)
   - Sản phẩm (tất cả hoặc sản phẩm cụ thể)
5. Người dùng chọn các tùy chọn và nhấn `Tạo báo cáo`.
6. Hệ thống tính toán và hiển thị báo cáo:
   - Tổng doanh thu
   - Biểu đồ xu hướng doanh thu theo thời gian
   - Bảng chi tiết giao dịch
7. Người dùng có thể `Xuất báo cáo` dạng Excel/CSV/PDF.

## Luồng phụ / ngoại lệ

- Nếu không có dữ liệu trong khoảng thời gian chọn, hệ thống thông báo "Không có dữ liệu".
- Người dùng chọn báo cáo `Lợi nhuận`:
  - Hiển thị: Doanh thu - Giá vốn = Lợi nhuận
  - Theo sản phẩm
  - Theo kênh bán (Online/Offline)
  - Tỷ suất lợi nhuận (%)
- Người dùng chọn báo cáo `Sản phẩm`:
  - Top sản phẩm bán chạy (theo số lượng/doanh thu)
  - Top sản phẩm tồn kho nhiều/ít
  - Sản phẩm không bán trong khoảng thời gian
  - Tốc độ tiêu thụ sản phẩm
- Người dùng chọn báo cáo `Tài chính` (chỉ Kế toán):
  - Thu/Chi
  - Nợ phải trả
  - Tình hình tiền mặt
  - Hóa đơn chưa thanh toán
- Người dùng có thể `Lập lịch báo cáo` để tự động nhận báo cáo theo email hàng ngày/tuần/tháng.
- Người dùng có thể `Lưu báo cáo` để xem lại sau này.
- Hỗ trợ so sánh báo cáo giữa 2 khoảng thời gian khác nhau.

## Yêu cầu phi chức năng liên quan

- Báo cáo phải được tạo trong vòng 30 giây với dữ liệu 1 năm.
- Hỗ trợ caching cho báo cáo thường xuyên.
- Biểu đồ phải hiển thị rõ ràng, tối ưu cho in ấn.
- Xuất Excel phải có định dạng chuyên nghiệp (header, format tiền tệ).
- Báo cáo PDF phải đẹp mắt, có logo công ty.

## Ghi chú

- Báo cáo nên hỗ trợ drill-down: nhấp vào số liệu để xem chi tiết.
- Hệ thống cần cảnh báo nếu doanh thu/lợi nhuận giảm so với tháng trước.
- Báo cáo có thể được chia sẻ với nhân viên khác.
- Dữ liệu báo cáo phải là real-time hoặc cập nhật trong 1 giờ.
