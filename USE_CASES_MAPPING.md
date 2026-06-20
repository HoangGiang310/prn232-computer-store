# Danh sách Use Case theo Vai Trò Hệ Thống

## Phân tích vai trò và Use Case

### 1. Các Vai Trò trong Hệ Thống

| Vai Trò                          | Mô tả                                                              | Diễn viên  |
| -------------------------------- | ------------------------------------------------------------------ | ---------- |
| **Admin**                        | Quản lý toàn bộ hệ thống, tài khoản, báo cáo, cấu hình             | admin      |
| **Sales** (Nhân viên bán hàng)   | Bán hàng offline (POS), tạo đơn, xử lý thanh toán, kiểm tra kho    | sales      |
| **Accountant** (Kế toán)         | Xem báo cáo tài chính, doanh thu, lợi nhuận, đối chiếu thanh toán  | accountant |
| **Warehouse** (Quản lý kho)      | Theo dõi tồn kho, nhập/xuất, cảnh báo, giao hàng, vận chuyển       | warehouse  |
| **Customer** (Khách hàng online) | Đặt hàng online, thanh toán, theo dõi giao hàng, quản lý tài khoản | customer   |

---

## Danh Sách Use Case Chi Tiết

### UC-01: Đăng nhập / Đăng xuất

- **Vai trò sử dụng**: Admin, Sales, Accountant, Warehouse
- **Loại**: Authentication
- **Mô tả**: Người dùng đăng nhập bằng tài khoản/mật khẩu và thoát khỏi hệ thống
- **Trạng thái**: ✅ Đã có (usecase1.md)

---

### UC-02: Quản lý sản phẩm

- **Vai trò sử dụng**: Admin, Sales (view only)
- **Loại**: Product Management
- **Mô tả**: Admin tạo/sửa/xóa sản phẩm, tải ảnh, quản lý thông tin kỹ thuật
- **Tính năng chính**:
  - Thêm/sửa/xóa sản phẩm
  - Upload nhiều ảnh
  - Tìm kiếm, lọc theo tên, mã, hãng, giá, trạng thái kho
  - Xem chi tiết sản phẩm
- **Trạng thái**: ✅ Đã có (usecase2.md)

---

### UC-03: Tạo/Quản lý đơn hàng offline (POS)

- **Vai trò sử dụng**: Sales, Admin
- **Loại**: Order Management
- **Mô tả**: Nhân viên bán hàng tạo đơn tại cửa hàng, chọn sản phẩm, xử lý thanh toán
- **Tính năng chính**:
  - Tạo đơn nhanh cho khách
  - Chọn sản phẩm, số lượng
  - Kiểm tra tồn kho thực tế
  - Áp dụng voucher/chiết khấu
  - Xử lý thanh toán (tiền mặt, thẻ, ví điện tử)
  - In hoá đơn/receipt
- **Trạng thái**: ⚠️ Bộ phận của UC-03 (cần tách riêng)

---

### UC-04: Quản lý tồn kho

- **Vai trò sử dụng**: Warehouse, Admin, Sales (view only)
- **Loại**: Inventory Management
- **Mô tả**: Theo dõi tồn kho, điều chỉnh nhập/xuất, nhận cảnh báo
- **Tính năng chính**:
  - Xem danh sách tồn kho theo sản phẩm
  - Nhập kho (mua hàng)
  - Xuất kho (bán hàng)
  - Xem cảnh báo thiếu hàng
  - Xem lịch sử điều chỉnh kho
- **Trạng thái**: ⚠️ Bộ phận của UC-04 (cần tách riêng)

---

### UC-05: Quản lý giao hàng / Vận chuyển

- **Vai trò sử dụng**: Warehouse, Sales, Admin
- **Loại**: Shipment Management
- **Mô tả**: Cập nhật thông tin vận chuyển, theo dõi trạng thái giao hàng
- **Tính năng chính**:
  - Ghi nhận thông tin vận chuyển (đơn vị, phí, số vận đơn)
  - Cập nhật trạng thái: đang chuyển, đã giao, gặp sự cố
  - Xem lịch sử giao hàng
  - Gửi thông báo khách hàng
- **Trạng thái**: ⚠️ Bộ phận của UC-04 (cần tách riêng)

---

### UC-06: Quản lý khách hàng

- **Vai trò sử dụng**: Admin, Sales
- **Loại**: Customer Management
- **Mô tả**: Tạo/sửa/xóa thông tin khách hàng, xem lịch sử mua hàng
- **Tính năng chính**:
  - Thêm/sửa/xóa thông tin khách
  - Xem lịch sử mua hàng
  - Xem danh sách đơn hàng liên quan
  - Lưu ghi chú nội bộ về khách
- **Trạng thái**: ❌ Chưa có

---

### UC-07: Quản lý khuyến mãi và Voucher

- **Vai trò sử dụng**: Admin
- **Loại**: Promotion Management
- **Mô tả**: Tạo/quản lý chương trình khuyến mãi, voucher, mã giảm giá
- **Tính năng chính**:
  - Tạo mã voucher
  - Thiết lập điều kiện: giá tối thiểu, thời hạn, số lần sử dụng, sản phẩm áp dụng
  - Xem danh sách voucher hoạt động
  - Vô hiệu hóa/xóa voucher
  - Xem thống kê sử dụng voucher
- **Trạng thái**: ❌ Chưa có

---

### UC-08: Hoàn tiền / Trả hàng

- **Vai trò sử dụng**: Sales, Warehouse, Admin
- **Loại**: Return Management
- **Mô tả**: Quản lý yêu cầu trả hàng, hoàn tiền, cập nhật tồn kho
- **Tính năng chính**:
  - Tạo phiếu trả hàng (với lý do)
  - Cập nhật trạng thái xử lý: yêu cầu, đang xử lý, đã hoàn, từ chối
  - Cập nhật tồn kho khi hàng về
  - Xử lý hoàn tiền
  - Xem lịch sử trả hàng
- **Trạng thái**: ⚠️ Bộ phận của UC-03 (cần tách riêng)

---

### UC-09: Báo cáo và Thống kê

- **Vai trò sử dụng**: Admin, Accountant
- **Loại**: Reporting & Analytics
- **Mô tả**: Xem báo cáo doanh thu, lợi nhuận, thống kê sản phẩm
- **Tính năng chính**:
  - Báo cáo doanh thu theo ngày/tuần/tháng
  - Báo cáo lợi nhuận theo sản phẩm
  - Báo cáo nợ, thu chi
  - Thống kê sản phẩm bán chạy
  - Báo cáo theo kênh Online/Offline
  - Xuất báo cáo Excel/CSV
  - Lọc theo ngày, sản phẩm, kênh bán
- **Trạng thái**: ❌ Chưa có

---

### UC-10: Quản lý người dùng / Nhân viên

- **Vai trò sử dụng**: Admin
- **Loại**: User Management
- **Mô tả**: Tạo/sửa/xóa tài khoản nhân viên, phân quyền vai trò
- **Tính năng chính**:
  - Tạo tài khoản nhân viên
  - Thiết lập vai trò (Admin, Sales, Accountant, Warehouse)
  - Vô hiệu hóa/xóa tài khoản
  - Xem lịch sử hoạt động nhân viên
  - Reset mật khẩu
- **Trạng thái**: ❌ Chưa có

---

### UC-11: Đặt hàng online (Khách hàng)

- **Vai trò sử dụng**: Customer
- **Loại**: Online Ordering
- **Mô tả**: Khách hàng đặt hàng qua website, thêm vào giỏ, chọn địa chỉ
- **Tính năng chính**:
  - Duyệt sản phẩm, tìm kiếm, lọc
  - Thêm sản phẩm vào giỏ hàng
  - Xem giỏ hàng, chỉnh sửa số lượng
  - Nhập thông tin giao nhận
  - Chọn phương thức vận chuyển
  - Áp dụng mã voucher
  - Xem tổng tiền trước khi thanh toán
- **Trạng thái**: ❌ Chưa có

---

### UC-12: Thanh toán online

- **Vai trò sử dụng**: Customer
- **Loại**: Payment
- **Mô tả**: Khách hàng thanh toán đơn hàng online qua ví điện tử
- **Tính năng chính**:
  - Chọn phương thức thanh toán (ví, chuyển khoản)
  - Xác nhận thanh toán
  - Nhận xác nhận thanh toán
  - Xem biên lai/hoá đơn
- **Trạng thái**: ❌ Chưa có

---

### UC-13: Theo dõi đơn hàng online (Khách hàng)

- **Vai trò sử dụng**: Customer
- **Loại**: Order Tracking
- **Mô tả**: Khách hàng xem trạng thái đơn, lịch sử mua, giao hàng
- **Tính năng chính**:
  - Xem danh sách đơn hàng cá nhân
  - Xem chi tiết đơn hàng
  - Theo dõi trạng thái giao hàng (đang chuyển, đã giao)
  - Xem số vận đơn
  - Nhận thông báo cập nhật trạng thái
- **Trạng thái**: ❌ Chưa có

---

### UC-14: Quản lý tài khoản khách hàng

- **Vai trò sử dụng**: Customer
- **Loại**: Account Management
- **Mô tả**: Khách hàng quản lý thông tin cá nhân, địa chỉ giao hàng
- **Tính năng chính**:
  - Đăng ký tài khoản (email, mật khẩu)
  - Xác thực email/OTP
  - Cập nhật thông tin cá nhân
  - Quản lý địa chỉ giao hàng
  - Đặt lại mật khẩu
  - Xem lịch sử mua hàng
- **Trạng thái**: ⚠️ Một phần (Đăng ký đã có — usecase12.md & usecase14.md; phần còn lại chưa có)

---

### UC-18: Đăng ký tài khoản khách hàng

- **Vai trò sử dụng**: Customer
- **Loại**: Authentication / Account Management
- **Mô tả**: Khách hàng tự tạo tài khoản mới qua website, được cấp JWT và đăng nhập tự động
- **Tính năng chính**:
  - Form đăng ký (username, email, họ tên, SĐT, địa chỉ, mật khẩu)
  - Validation đầu vào (username 3-50 ký tự, email hợp lệ, mật khẩu ≥ 6 ký tự)
  - Kiểm tra trùng username/email
  - Mã hóa mật khẩu, tạo bản ghi User + Customer
  - Đăng ký công khai chỉ tạo vai trò customer
  - Cấp JWT token và điều hướng vào trang khách hàng
- **Trạng thái**: ✅ Đã có (usecase14.md) — backend `POST /api/auth/register`, frontend `pages/register.tsx`

---

### UC-15: Đánh giá và Bình luận Sản phẩm

- **Vai trò sử dụng**: Customer
- **Loại**: Review & Rating
- **Mô tả**: Khách hàng đánh giá sao và viết bình luận sản phẩm
- **Tính năng chính**:
  - Đánh giá sao (1-5)
  - Viết bình luận
  - Xem bình luận từ khách khác
  - Xóa bình luận của mình
- **Trạng thái**: ❌ Chưa có

---

### UC-16: Quản lý Email và Thông báo

- **Vai trò sử dụng**: Admin, Sales, Warehouse, Customer
- **Loại**: Notification
- **Mô tả**: Hệ thống tự động gửi email, thông báo theo sự kiện
- **Tính năng chính**:
  - Gửi email xác nhận đơn hàng
  - Gửi hoá đơn/invoice
  - Gửi cập nhật trạng thái giao hàng
  - Gửi cảnh báo tồn kho thấp
  - Gửi thông báo đơn hàng mới (cho staff)
  - Gửi email reset mật khẩu
- **Trạng thái**: ❌ Chưa có

---

### UC-17: Import/Export Dữ liệu

- **Vai trò sử dụng**: Admin, Accountant
- **Loại**: Data Management
- **Mô tả**: Xuất/nhập dữ liệu dạng Excel/CSV
- **Tính năng chính**:
  - Xuất danh sách sản phẩm
  - Xuất danh sách đơn hàng
  - Xuất báo cáo tài chính
  - Nhập danh sách sản phẩm (batch update)
  - Nhập danh sách khách hàng
- **Trạng thái**: ❌ Chưa có

---

## Tóm tắt Số Lượng Use Case

| Trạng thái    | Số lượng | Chi tiết                                                                    |
| ------------- | -------- | --------------------------------------------------------------------------- |
| ✅ Đã có      | 4        | UC-01, UC-02, UC-03, UC-04                                                  |
| ⚠️ Cần tách   | 3        | UC-03 (POS), UC-04 (giao hàng), UC-08 (trả hàng)                            |
| ❌ Chưa có    | 10       | UC-06, UC-07, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17 |
| **Tổng cộng** | **17**   | Bao gồm main + phụ                                                          |

---

## Khuyến nghị

### Giai đoạn 1 (MVP - Ưu tiên cao):

- UC-01: Đăng nhập
- UC-02: Quản lý sản phẩm
- UC-03: Tạo đơn offline (POS)
- UC-04: Quản lý tồn kho
- UC-09: Báo cáo cơ bản
- UC-10: Quản lý người dùng
- UC-11: Đặt hàng online
- UC-12: Thanh toán online

### Giai đoạn 2 (Expansion - 3-6 tháng):

- UC-05: Vận chuyển
- UC-06: Quản lý khách hàng
- UC-07: Voucher/Khuyến mãi
- UC-08: Trả hàng/Hoàn tiền
- UC-13: Theo dõi giao hàng
- UC-14: Tài khoản khách hàng
- UC-15: Đánh giá sản phẩm

### Giai đoạn 3 (Enhancement - 6-9 tháng):

- UC-16: Email/Thông báo tự động
- UC-17: Import/Export

---

## Mapping Vai trò - Use Case

| Vai trò        | Use Case                                        |
| -------------- | ----------------------------------------------- |
| **Admin**      | UC-01, UC-02, UC-03, UC-09, UC-10, UC-16, UC-17 |
| **Sales**      | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-08 |
| **Accountant** | UC-01, UC-09, UC-17                             |
| **Warehouse**  | UC-01, UC-04, UC-05, UC-08                      |
| **Customer**   | UC-11, UC-12, UC-13, UC-14, UC-15, UC-18        |
