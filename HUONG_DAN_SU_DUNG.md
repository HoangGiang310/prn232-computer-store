# HƯỚNG DẪN SỬ DỤNG — TQG Computer Store

Tài liệu này hướng dẫn cài đặt, khởi chạy và sử dụng toàn bộ chức năng của hệ thống quản lý & bán hàng laptop **TQG Computer Store** (backend ASP.NET Core + frontend Next.js + mobile Flutter).

> Đối tượng đọc: người vận hành cửa hàng (Admin, Nhân viên bán hàng, Kế toán, Quản lý kho) và khách hàng mua online.

---

## 1. Tổng quan hệ thống

Hệ thống gồm 3 thành phần:

| Thành phần | Công nghệ | Vai trò |
| ---------- | --------- | ------- |
| `backend/` | ASP.NET Core 8 + EF Core + PostgreSQL + JWT | API duy nhất phục vụ tất cả vai trò |
| `frontend/` | Next.js + TypeScript | Web cho Admin, Nhân viên và Khách hàng |
| `mobile/` | Flutter | App khách hàng đặt hàng online |

Có **5 vai trò**: `admin`, `sales` (bán hàng), `accountant` (kế toán), `warehouse` (kho), `customer` (khách hàng). Mỗi vai trò sau khi đăng nhập sẽ được đưa tới trang phù hợp.

---

## 2. Cài đặt và khởi chạy

### 2.1 Yêu cầu môi trường
- .NET 8 SDK
- Node.js 18+ và npm
- PostgreSQL đang chạy (mặc định cổng 5432)
- (Tùy chọn) Flutter SDK nếu chạy app mobile

### 2.2 Chạy Backend (API)
1. Mở `backend/appsettings.json`, cập nhật chuỗi kết nối PostgreSQL cho đúng máy bạn:
   ```
   "DefaultConnection": "Host=localhost;Port=5432;Database=computerstore;Username=postgres;Password=12345"
   ```
2. Tại thư mục `backend`, chạy:
   ```
   dotnet restore
   dotnet run --urls "http://localhost:5000"
   ```
3. Lần chạy đầu, hệ thống sẽ **tự tạo database**, **áp dụng migration** và **gieo dữ liệu mẫu** (sản phẩm, voucher, đơn hàng, đánh giá...).
4. Tài liệu API (Swagger) ở: `http://localhost:5000/swagger`

> Quan trọng: Frontend gọi API tại `http://localhost:5000`. Hãy chạy backend đúng cổng 5000, hoặc đặt biến môi trường `NEXT_PUBLIC_API_URL` ở frontend cho khớp.

### 2.3 Chạy Frontend (Web)
Tại thư mục `frontend`:
```
npm install
npm run dev
```
Web chạy ở: **`http://localhost:3001`**

### 2.4 Chạy Mobile (tùy chọn)
Tại thư mục `mobile`:
```
flutter pub get
flutter run
```

---

## 3. Đăng nhập & Tài khoản

### 3.1 Cách nhanh nhất để bắt đầu: tạo tài khoản khách hàng
1. Vào `http://localhost:3001` → bấm **ĐĂNG KÝ** (hoặc vào `/register`).
2. Nhập tên đăng nhập, email, mật khẩu (tối thiểu 6 ký tự), họ tên, số điện thoại, địa chỉ.
3. Bấm **Đăng ký ngay** → hệ thống tạo tài khoản khách hàng và tự đăng nhập, đưa bạn tới trang khách hàng.

> Đăng ký công khai **chỉ tạo tài khoản khách hàng**. Tài khoản nhân viên do Admin tạo (xem mục 4.6).

### 3.2 Tài khoản mẫu có sẵn (đăng nhập được ngay)
Khi backend khởi chạy lần đầu, hệ thống gieo sẵn các tài khoản với **mật khẩu mặc định: `Password@123`** (đã được mã hóa đúng chuẩn):

| Vai trò | Tên đăng nhập | Mật khẩu |
| ------- | ------------- | -------- |
| Admin | `admin_01` | `Password@123` |
| Nhân viên bán hàng | `sales_01` | `Password@123` |
| Kế toán | `acc_01` | `Password@123` |
| Quản lý kho | `kho_01` | `Password@123` |
| Khách hàng online | `longkhachhang` | `Password@123` |

> Nếu bạn đã chạy phiên bản cũ và database còn mật khẩu lỗi, chỉ cần khởi động lại backend — hệ thống tự sửa (re-hash) các mật khẩu giữ chỗ cũ về `Password@123`.

Sau khi đăng nhập Admin, bạn nên tạo thêm tài khoản nhân viên trong giao diện **Quản lý nhân viên** (xem mục 4.6).

### 3.3 Đăng nhập và đăng xuất
1. Vào `/login`, nhập tên đăng nhập + mật khẩu.
2. Hệ thống điều hướng theo vai trò:

| Vai trò | Trang đích sau đăng nhập |
| ------- | ------------------------ |
| admin | `/admin` |
| sales | `/staff` |
| accountant | `/bookkeeper` |
| warehouse | `/manager` |
| customer | `/customer` |

3. Đăng xuất: bấm **Đăng xuất** ở góc trên mỗi trang.

---

## 4. Hướng dẫn theo vai trò

### 4.1 Khách hàng (Customer) — trang `/customer`
Đây là trang mua sắm online.
- **Duyệt sản phẩm:** xem danh sách laptop, giá, tồn kho.
- **Thêm vào giỏ:** bấm *Thêm vào giỏ*; chỉnh số lượng hoặc xóa trong khu vực Giỏ hàng.
- **Đặt hàng:** nhập thông tin giao nhận (tên, SĐT, địa chỉ), chọn phương thức thanh toán (Ví điện tử / Thẻ / Tiền mặt), nhập **mã voucher** nếu có, rồi bấm **Đặt hàng ngay**.
- **Theo dõi đơn:** mục *Lịch sử đơn hàng* hiển thị trạng thái từng đơn (New → Confirmed → Shipping → Delivered…).
- **Xem chi tiết & đánh giá:** bấm *Chi tiết & Đánh giá* ở thẻ sản phẩm (xem mục 5).

### 4.2 Nhân viên bán hàng (Sales) — trang `/staff`
- **Tạo đơn tại quầy (POS):** vào `/create-order`, chọn sản phẩm + số lượng, hệ thống kiểm tra tồn kho thực tế, áp dụng voucher/chiết khấu, chọn phương thức thanh toán (tiền mặt/thẻ/ví), xác nhận đơn → tồn kho tự trừ.
- **Xem & cập nhật đơn hàng:** vào `/orders` để xem tất cả đơn (online + offline), cập nhật trạng thái, thông tin vận chuyển.
- **Quản lý khách hàng:** vào `/customers` để thêm/sửa/tìm khách và xem lịch sử mua.
- **Xem tồn kho:** vào `/inventory` (quyền xem).

### 4.3 Quản lý kho (Warehouse) — trang `/manager`
- **Theo dõi tồn kho:** `/inventory` hiển thị số lượng từng sản phẩm và **cảnh báo sắp hết hàng** theo ngưỡng.
- **Nhập/Xuất/Điều chỉnh kho:** chọn sản phẩm, nhập số lượng (+ nhập kho, − xuất/điều chỉnh) kèm lý do. Hệ thống chặn tồn kho âm và lưu **lịch sử điều chỉnh** (ai làm, khi nào).
- **Cập nhật vận chuyển:** trong `/orders`, cập nhật đơn vị vận chuyển, số vận đơn và trạng thái giao hàng.

### 4.4 Kế toán (Accountant) — trang `/bookkeeper`
- **Báo cáo & thống kê:** vào `/reports` để xem:
  - Doanh thu & lợi nhuận theo khoảng thời gian (chọn ngày bắt đầu/kết thúc).
  - Phân tách theo kênh **Online / Offline**.
  - Top sản phẩm bán chạy.
  - Trạng thái kho (còn hàng / sắp hết / hết hàng).

### 4.5 Admin — trang `/admin`
Admin có bảng điều khiển truy cập tất cả chức năng qua các thẻ:
- **QUẢN LÝ SẢN PHẨM** (`/products`): thêm/sửa/xóa laptop, mã, hãng, cấu hình, giá nhập/bán, tồn kho, ngưỡng cảnh báo; tìm kiếm & lọc.
- **QUẢN LÝ ĐƠN HÀNG** (`/orders`): theo dõi & cập nhật mọi đơn.
- **TẠO ĐƠN HÀNG MỚI** (`/create-order`): tạo đơn POS.
- **QUẢN LÝ KHO** (`/inventory`).
- **QUẢN LÝ KHÁCH HÀNG** (`/customers`).
- **QUẢN LÝ VOUCHER** (`/vouchers`): tạo mã giảm giá (theo % hoặc số tiền), điều kiện đơn tối thiểu, thời hạn, giới hạn số lần dùng.
- **QUẢN LÝ NHÂN VIÊN** (`/users`): xem mục 4.6.
- **BÁO CÁO & THỐNG KÊ** (`/reports`).
- **KIỂM DUYỆT ĐÁNH GIÁ** (`/reviews`): xem mục 5.3.

### 4.6 Quản lý nhân viên (Admin) — trang `/users`
- **Tạo tài khoản:** nhập họ tên, username, email, chọn vai trò (admin/sales/accountant/warehouse), đặt mật khẩu. Mật khẩu được **mã hóa** trước khi lưu.
- **Sửa thông tin / đổi vai trò / bật-tắt hoạt động.**
- **Reset mật khẩu:** đặt lại mật khẩu cho nhân viên.
- **Vô hiệu hóa (soft delete):** giữ lại dữ liệu để truy vết.

---

## 5. Chức năng Đánh giá & Bình luận sản phẩm (UC-15)

### 5.1 Điều kiện để đánh giá
- Phải đăng nhập bằng **tài khoản khách hàng**.
- Phải **đã mua** sản phẩm (đơn ở trạng thái *Delivered* hoặc *Confirmed*).
- Mỗi khách chỉ có **1 đánh giá / sản phẩm** (lần sau là chỉnh sửa).

### 5.2 Khách hàng viết / sửa / xóa đánh giá
1. Vào trang chi tiết sản phẩm: từ `/customer` bấm **Chi tiết & Đánh giá**, hoặc trong lịch sử đơn đã giao bấm **[Đánh giá]**.
2. Bấm **Viết đánh giá**: chọn số sao (1–5), nhập tiêu đề (tùy chọn) và nội dung.
3. Bấm **Gửi đánh giá**. Đánh giá hiển thị kèm nhãn **✓ Đã mua hàng**.
4. Với đánh giá của mình, bạn có thể bấm **Sửa** hoặc **Xóa**.
5. Người xem khác có thể bấm **👍 Hữu ích** để tăng độ tin cậy của bình luận.

### 5.3 Admin kiểm duyệt đánh giá — trang `/reviews`
- Xem tất cả đánh giá (kể cả đã ẩn), lọc theo *Đang hiển thị / Đã ẩn*.
- **Ẩn bình luận** không phù hợp (ẩn mềm — vẫn lưu để truy vết) hoặc **Hiện lại**.

### 5.4 Xem đánh giá
Trên trang chi tiết sản phẩm, mọi người xem được: trung bình sao, biểu đồ phân bố sao, danh sách bình luận; có thể **sắp xếp** (Hữu ích nhất / Mới nhất / Cao nhất / Thấp nhất) và **lọc theo số sao**.

---

## 6. Quy trình mẫu (end-to-end)

**Bán online từ A→Z:**
1. Khách đăng ký tài khoản → đăng nhập.
2. Khách thêm sản phẩm vào giỏ → đặt hàng (có thể nhập voucher).
3. Sales/Admin vào `/orders` xác nhận đơn (New → Confirmed).
4. Warehouse cập nhật vận chuyển & trạng thái (Shipping → Delivered); tồn kho được trừ tự động.
5. Khi đơn *Delivered*, khách quay lại viết **đánh giá** sản phẩm.
6. Kế toán/Admin xem **báo cáo** doanh thu, lợi nhuận theo kênh.

**Trả hàng / hoàn tiền:** từ đơn hàng tạo phiếu trả hàng (lý do) → Warehouse/Admin duyệt → tồn kho hoàn lại, trạng thái chuyển *Returned*.

---

## 7. Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân & cách khắc phục |
| ----------- | --------------------------- |
| Đăng nhập nhân viên mẫu báo sai mật khẩu | Dùng mật khẩu mặc định `Password@123`. Nếu database cũ còn lỗi, khởi động lại backend để hệ thống tự re-hash. |
| Web không tải được dữ liệu | Backend chưa chạy hoặc sai cổng. Đảm bảo API chạy ở `http://localhost:5000`. |
| Lỗi CORS | Frontend phải chạy ở cổng 3000 hoặc 3001 (đã cấu hình CORS sẵn). |
| Không kết nối database | Kiểm tra PostgreSQL đang chạy và chuỗi kết nối trong `appsettings.json`. |
| Không viết được đánh giá | Bạn chưa đăng nhập bằng customer, hoặc chưa mua/đơn chưa ở trạng thái Delivered/Confirmed. |
| Mất dữ liệu sau khi sửa code model | Chạy lại `dotnet run` để áp dụng migration mới; dữ liệu mẫu chỉ gieo khi bảng trống. |

---

## 8. Tài khoản & thông tin tham khảo nhanh

- Web: `http://localhost:3001`
- API: `http://localhost:5000` — Swagger: `/swagger`
- Đăng ký khách hàng: `/register`
- Tài khoản nhân viên mẫu (mật khẩu `Password@123`): `admin_01`, `sales_01`, `acc_01`, `kho_01`
- Khách hàng mẫu online (mật khẩu `Password@123`): `longkhachhang`

---

_Chúc bạn sử dụng hệ thống hiệu quả! Mọi tính năng đều bám theo các use case trong thư mục tài liệu (`usecase*.md`, `USE_CASES_MAPPING.md`)._
