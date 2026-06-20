# Use Case 14: Đăng ký tài khoản khách hàng

## Mã Use Case

UC-18

## Tên

Đăng ký tài khoản khách hàng (Customer Registration)

## Diễn giải

Khách hàng truy cập website và tự tạo một tài khoản khách hàng mới bằng cách cung cấp tên đăng nhập, email, mật khẩu và thông tin liên hệ. Sau khi đăng ký thành công, hệ thống tạo tài khoản, tạo bản ghi khách hàng tương ứng, cấp JWT token và điều hướng khách hàng vào khu vực mua sắm online. Đây là use case nền tảng cho các use case khách hàng khác (đặt hàng online, theo dõi đơn hàng, đánh giá sản phẩm).

## Diễn viên chính

- Khách hàng online (Customer)

## Các diễn viên phụ

- Hệ thống xác thực (AuthController)
- Hệ thống quản lý tài khoản (User)
- Hệ thống quản lý khách hàng (Customer)
- Cơ sở dữ liệu người dùng (PostgreSQL)

## Điều kiện tiên quyết

- Khách hàng truy cập được trang đăng ký (`/register`).
- Khách hàng có địa chỉ email hợp lệ.
- Khách hàng chưa có tài khoản với cùng tên đăng nhập hoặc email.

## Điều kiện hậu yêu cầu

- Tài khoản người dùng mới được tạo trong bảng `Users` với vai trò `customer` và trạng thái hoạt động (`IsActive = true`).
- Một bản ghi khách hàng tương ứng được tạo trong bảng `Customers`.
- Mật khẩu được mã hóa (hash) trước khi lưu, không lưu plaintext.
- Hệ thống cấp JWT token và đăng nhập khách hàng tự động.
- Khách hàng được điều hướng tới trang khách hàng (`/customer`).

## Luồng chính

1. Khách hàng mở trang chủ hoặc trang đăng nhập và chọn `Đăng ký`.
2. Hệ thống hiển thị trang đăng ký với biểu mẫu gồm các trường:
   - Tên đăng nhập (bắt buộc)
   - Email (bắt buộc)
   - Họ và tên (tùy chọn)
   - Số điện thoại (tùy chọn)
   - Địa chỉ (tùy chọn)
   - Mật khẩu (bắt buộc)
   - Xác nhận mật khẩu (bắt buộc)
3. Khách hàng nhập thông tin và nhấn nút `Đăng ký ngay`.
4. Giao diện kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau.
5. Giao diện gửi yêu cầu `POST /api/auth/register` kèm dữ liệu đăng ký.
6. Hệ thống kiểm tra hợp lệ dữ liệu đầu vào:
   - Tên đăng nhập từ 3 đến 50 ký tự.
   - Email đúng định dạng.
   - Mật khẩu tối thiểu 6 ký tự.
7. Hệ thống kiểm tra tên đăng nhập và email chưa tồn tại trong cơ sở dữ liệu.
8. Hệ thống xác định vai trò là `customer` (đăng ký công khai chỉ tạo vai trò khách hàng).
9. Hệ thống mã hóa mật khẩu và tạo bản ghi `User` mới.
10. Hệ thống tạo bản ghi `Customer` tương ứng (tên, email, số điện thoại, địa chỉ, tài khoản web).
11. Hệ thống lưu thay đổi vào cơ sở dữ liệu.
12. Hệ thống tạo JWT token và trả về thông tin tài khoản (token, role, username, fullName).
13. Giao diện lưu token, hiển thị thông báo `Đăng ký thành công` và điều hướng khách hàng tới trang `/customer`.

## Luồng phụ / ngoại lệ

- **Mật khẩu xác nhận không khớp**: Giao diện hiển thị lỗi `Mật khẩu xác nhận không khớp` và không gửi yêu cầu.
- **Thiếu trường bắt buộc hoặc sai định dạng**: Hệ thống trả về HTTP 400 với thông báo lỗi validation tương ứng (tên đăng nhập, email, mật khẩu).
- **Tên đăng nhập hoặc email đã tồn tại**: Hệ thống trả về HTTP 400 với thông báo `Tên tài khoản hoặc email đã tồn tại trên hệ thống.`.
- **Cố tình đăng ký vai trò nội bộ** (admin, sales, accountant, warehouse): Hệ thống từ chối (HTTP 403) với thông báo đăng ký công khai chỉ dành cho khách hàng; tài khoản nhân viên phải do Admin tạo qua UC-10.
- **Lỗi máy chủ / mất kết nối**: Giao diện hiển thị thông báo `Đăng ký thất bại. Vui lòng thử lại.`.

## Yêu cầu phi chức năng liên quan

- Mật khẩu phải được hash (bcrypt/PBKDF2 qua `PasswordHasher`) trước khi lưu.
- Giao tiếp phải qua HTTPS.
- Phản hồi đăng ký nhanh (< 1 giây ở điều kiện bình thường).
- Thông báo lỗi rõ ràng, dễ hiểu cho người dùng.
- Chống tạo trùng tài khoản (ràng buộc tên đăng nhập và email duy nhất).

## Ánh xạ mã nguồn (Implementation Mapping)

- **Backend endpoint**: `POST /api/auth/register` — `backend/Controllers/AuthController.cs`.
- **DTO đầu vào**: `backend/DTOs/RegisterDto.cs` (có DataAnnotations validation).
- **Model**: `backend/Models/User.cs`, `backend/Models/Customer.cs`, `backend/Models/Role.cs`.
- **Sinh token**: `backend/Services/JwtService.cs`.
- **Frontend trang**: `frontend/pages/register.tsx`.
- **Hàm gọi API**: `register()` trong `frontend/lib/auth.ts`.
- **Liên kết điều hướng**: từ `frontend/pages/login.tsx` và `frontend/pages/index.tsx`.

## Ghi chú

- Đăng ký công khai hiện chỉ tạo vai trò `customer`. Tài khoản nhân viên (admin, sales, accountant, warehouse) được tạo bởi Admin qua UC-10 (Quản lý người dùng).
- Tài khoản được kích hoạt ngay (`IsActive = true`). Bước xác thực email/OTP là cải tiến dự kiến cho giai đoạn sau (xem UC-14 trong `usecase12.md`).
- Use case này là một phần mở rộng tách riêng của UC-14 (Quản lý tài khoản khách hàng) nhằm mô tả chi tiết luồng đăng ký theo đúng mã nguồn đã triển khai.
