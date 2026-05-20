I. Yêu Cầu Chức Năng (Functional Requirements)
Hệ thống sẽ bao gồm 3 phân hệ chính: Khách hàng (Front-end), Quản trị viên/Nhân viên (Back-end/Admin), và Hệ thống (System).

1. Phân hệ dành cho Khách hàng (User/Customer)
   Đăng ký/Đăng nhập: \_ Đăng ký bằng Email/Số điện thoại.
   Đăng nhập qua mật khẩu hoặc qua bên thứ ba (Google, Facebook).Chức năng "Quên mật khẩu" qua OTP Email/SMS.
   Xem và tìm kiếm sản phẩm:
   Tìm kiếm thông minh theo tên, thương hiệu (Dell, Asus, Macbook...).
   Bộ lọc đặc thù cho Laptop: Lọc theo khoảng giá, CPU (Intel Core i5/i7, Ryzen 5...), RAM (8GB, 16GB...), Ổ cứng (SSD 512GB...), Nhu cầu (Văn phòng, Gaming, Đồ họa).
   Sắp xếp theo giá (tăng/giảm), bán chạy, mới nhất.
   Trang chi tiết sản phẩm:
   Hiển thị hình ảnh (slider), thông số kỹ thuật chi tiết.
   Hiển thị trạng thái kho hàng (Còn hàng/Hết hàng).
   Mục đánh giá (Rating) và bình luận (Comment) của khách hàng đã mua.
   Giỏ hàng & Thanh toán (Checkout):
   Thêm/Sửa/Xóa sản phẩm trong giỏ hàng.
   Áp dụng mã giảm giá (Coupon/Voucher).
   Tính toán tổng tiền, phí vận chuyển tự động.
   Tích hợp cổng thanh toán: COD (Tiền mặt), Chuyển khoản ngân hàng, Ví điện tử (Momo, VNPAY).
   Quản lý tài khoản cá nhân:
   Thay đổi thông tin cá nhân, địa chỉ nhận hàng.Xem lịch sử đơn hàng và theo dõi trạng thái đơn hàng (Chờ duyệt, Đang giao, Đã giao, Đã hủy).
2. Phân hệ dành cho Quản trị viên & Nhân viên (Admin/Staff)
   Quản lý sản phẩm (Laptop):
   Thêm, sửa, xóa, ẩn/hiển thị sản phẩm.Quản lý cấu hình chi tiết (Thuộc tính động: CPU, RAM, GPU, Màn hình...).
   Quản lý số lượng tồn kho theo từng phiên bản cấu hình.
   Quản lý đơn hàng:
   Tiếp nhận, thay đổi trạng thái đơn hàng.
   In hóa đơn/Phiếu xuất kho.
   Xử lý hoàn trả/Hủy đơn.
   Quản lý khách hàng & Phân quyền:
   Quản lý thông tin khách hàng, lịch sử mua hàng.
   Phân quyền tài khoản nội bộ: Admin (toàn quyền), Khách hàng, Nhân viên bán hàng (chỉ xử lý đơn), Nhân viên kho (chỉ cập nhật tồn kho).
   Quản lý chương trình khuyến mãi:
   Tạo mã giảm giá (theo % hoặc số tiền cố định).
   Cài đặt flash sale, giảm giá trực tiếp trên sản phẩm theo thời gian thực.
   Báo cáo & Thống kê (Dashboard):
   Thống kê doanh thu theo ngày/tuần/tháng/năm.
   Top sản phẩm bán chạy, sản phẩm sắp hết hàng trong kho.Thống kê số lượng đơn hàng thành công/bị hủy.
   II. Yêu Cầu Phi Chức Năng (Non-functional Requirements)
   Để website vận hành mượt mà và mang lại trải nghiệm tốt, các tiêu chuẩn dưới đây cần được đáp ứng:
   Tiêu chíYêu cầu chi tiếtHiệu năng (Performance)_ Thời gian tải trang (Page Load Time) dưới 2 giây đối với mạng tiêu chuẩn._ Hệ thống chịu tải được tối thiểu 1,000 người dùng truy cập đồng thời (Concurrent Users) mà không bị sập.Giao diện (UI/UX)_ Giao diện tương thích (Responsive) tốt trên Desktop, Laptop, Tablet và Mobile._ Quy trình thanh toán tối giản (Tối đa 3 bước).Bảo mật (Security)_ Mã hóa toàn bộ dữ liệu truyền tải qua giao thức HTTPS (SSL)
   ._ Mật khẩu người dùng phải được băm (Hash) trước khi lưu vào Database (ví dụ dùng Bcrypt)._ Phòng chống các lỗ hổng bảo mật phổ biến: SQL Injection, XSS, CSRF.Độ tin cậy (Availability)_ Hệ thống hoạt động liên tục với thời gian uptime tối thiểu 99.9%.\_ Có cơ chế tự động lưu trữ dữ liệu (Backup) hàng ngày phòng trường hợp sự cố.Mở rộng (Scalability)\* Kiến trúc mã nguồn rõ ràng (ví dụ: MVC, Microservices) để dễ dàng nâng cấp, tích hợp thêm các dịch vụ vận chuyển (Giao Hàng Nhanh, Viettel Post) sau này.
