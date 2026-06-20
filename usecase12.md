# Use Case 12: Quản lý tài khoản khách hàng

## Mã Use Case

UC-14

## Tên

Quản lý tài khoản khách hàng

## Diễn giải

Khách hàng đăng ký tài khoản, xác thực email, cập nhật thông tin cá nhân, quản lý địa chỉ giao hàng, và đặt lại mật khẩu.

## Diễn viên chính

- Khách hàng (Customer)

## Các diễn viên phụ

- Hệ thống xác thực
- Hệ thống quản lý tài khoản
- Hệ thống email
- Cơ sở dữ liệu người dùng

## Điều kiện tiên quyết

- Khách hàng có địa chỉ email hoặc số điện thoại hợp lệ.
- Khách hàng có kết nối internet để nhận email xác thực.

## Điều kiện hậu yêu cầu

- Tài khoản được tạo thành công và kích hoạt.
- Khách hàng có thể đăng nhập và sử dụng tất cả tính năng.
- Thông tin cá nhân được lưu trữ an toàn.

## Luồng chính: Đăng Ký Tài Khoản

1. Khách hàng truy cập website bán hàng.
2. Khách hàng chọn nút `Đăng ký` hoặc `Tạo tài khoản`.
3. Hệ thống mở trang đăng ký với form:
   - Email hoặc số điện thoại
   - Mật khẩu
   - Xác nhận mật khẩu
   - Tên đầy đủ
   - Nhập lại email/số điện thoại để xác nhận
4. Khách hàng nhập thông tin và nhấn `Đăng ký`.
5. Hệ thống xác thực:
   - Email/số điện thoại chưa được sử dụng
   - Mật khẩu mạnh (>= 8 ký tự, chứa chữ hoa, chữ thường, số)
6. Hệ thống tạo tài khoản với trạng thái "Chưa kích hoạt".
7. Hệ thống gửi email xác nhận chứa:
   - Link xác nhận (hoặc mã OTP)
   - Hướng dẫn kích hoạt tài khoản
8. Khách hàng nhấn link xác nhận hoặc nhập mã OTP.
9. Hệ thống kích hoạt tài khoản và hiển thị thông báo `Tài khoản đã được kích hoạt thành công`.
10. Khách hàng có thể đăng nhập ngay.

## Luồng chính: Quản Lý Thông Tin Cá Nhân

1. Khách hàng đăng nhập và truy cập trang `Tài khoản của tôi` hoặc `Hồ sơ cá nhân`.
2. Hệ thống hiển thị thông tin hiện tại:
   - Tên đầy đủ
   - Email
   - Số điện thoại
   - Ngày sinh (nếu cập nhật)
   - Giới tính (nếu cập nhật)
   - Địa chỉ mặc định
3. Khách hàng chọn `Sửa thông tin`.
4. Khách hàng cập nhật thông tin và nhấn `Lưu`.
5. Hệ thống xác thực và lưu thay đổi.
6. Hệ thống hiển thị thông báo `Cập nhật thông tin thành công`.

## Luồng chính: Quản Lý Địa Chỉ Giao Hàng

1. Khách hàng truy cập trang `Địa chỉ giao hàng` hoặc `Địa chỉ của tôi`.
2. Hệ thống hiển thị danh sách địa chỉ đã lưu:
   - Địa chỉ mặc định (đánh dấu)
   - Các địa chỉ khác
3. Khách hàng chọn `Thêm địa chỉ mới`.
4. Hệ thống mở form:
   - Tên người nhận (hoặc mặc định = tên khách)
   - Số điện thoại
   - Tỉnh/Thành phố
   - Quận/Huyện
   - Phường/Xã
   - Đường/Địa chỉ chi tiết
   - Ghi chú (nhà, công ty, số nhà, v.v.)
   - Đặt làm mặc định (checkbox)
5. Khách nhập thông tin và nhấn `Lưu địa chỉ`.
6. Hệ thống lưu và hiển thị thông báo thành công.
7. Khách có thể `Sửa` hoặc `Xóa` địa chỉ đã lưu.

## Luồng chính: Đặt Lại Mật Khẩu

1. Khách hàng chọn `Quên mật khẩu` trên trang đăng nhập.
2. Hệ thống yêu cầu nhập email.
3. Khách hàng nhập email và nhấn `Tiếp tục`.
4. Hệ thống kiểm tra email tồn tại và gửi email reset:
   - Link reset (hoặc mã OTP)
   - Hướng dẫn đặt lại mật khẩu
5. Khách hàng nhấn link hoặc nhập mã OTP.
6. Hệ thống mở trang `Đặt lại mật khẩu` với form:
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
7. Khách nhập mật khẩu mới và nhấn `Đặt lại mật khẩu`.
8. Hệ thống cập nhật mật khẩu và hiển thị `Mật khẩu đã được đặt lại thành công`.
9. Khách hàng đăng nhập lại với mật khẩu mới.

## Luồng phụ / ngoại lệ

- **Email xác nhận bị thất lạc**:
  1. Khách chọn `Gửi lại email xác nhận`
  2. Hệ thống gửi lại email

- **Mật khẩu không đủ mạnh**:
  1. Hệ thống hiển thị yêu cầu: "Mật khẩu phải chứa ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số"
  2. Khách nhập lại mật khẩu

- **Email đã được sử dụng**:
  1. Hệ thống thông báo: "Email này đã được đăng ký"
  2. Khách chọn đăng nhập hoặc sử dụng email khác

- **Đổi mật khẩu**:
  1. Khách hàng truy cập `Bảo mật` hoặc `Cài đặt`
  2. Chọn `Đổi mật khẩu`
  3. Nhập mật khẩu cũ, mật khẩu mới, xác nhận
  4. Hệ thống xác thực mật khẩu cũ và cập nhật

- **Xóa tài khoản**:
  1. Khách chọn `Xóa tài khoản vĩnh viễn`
  2. Hệ thống cảnh báo: "Hành động này không thể hoàn tác, tất cả dữ liệu sẽ bị xóa"
  3. Khách xác nhận
  4. Hệ thống soft delete tài khoản và dữ liệu cá nhân (theo GDPR)

- **Đăng nhập bằng Google/Facebook** (nếu hỗ trợ):
  1. Khách chọn nút `Đăng ký với Google` hoặc `Facebook`
  2. Hệ thống chuyển hướng tới dịch vụ xác thực
  3. Khách xác nhận và tài khoản được tạo tự động

## Yêu cầu phi chức năng liên quan

- Tất cả giao tiếp phải qua HTTPS (bảo mật).
- Mật khẩu phải được hash bcrypt hoặc tương đương (không lưu plaintext).
- Email xác nhận phải gửi trong vòng 1 phút.
- Trang cá nhân phải tải nhanh (< 2 giây).
- Hỗ trợ 2FA (two-factor authentication) tùy chọn cho bảo mật cao.

## Trạng thái triển khai (so với mã nguồn hiện tại)

- ✅ **Đã triển khai**: Đăng ký tài khoản khách hàng (xem chi tiết tại `usecase14.md`).
  - Endpoint backend: `POST /api/auth/register` (AuthController).
  - DTO: `RegisterDto` (có validation: username 3-50 ký tự, email hợp lệ, mật khẩu ≥ 6 ký tự).
  - Trang frontend: `pages/register.tsx` (liên kết từ `/login` và trang chủ).
  - Tài khoản được kích hoạt ngay (`IsActive = true`), chưa có bước OTP/xác thực email.
  - Đăng ký công khai chỉ tạo vai trò `customer`; vai trò nội bộ do Admin tạo qua UC-10.
- ⏳ **Chưa triển khai (dự kiến)**: Xác thực email/OTP, quản lý nhiều địa chỉ giao hàng, đặt lại mật khẩu qua email, đổi mật khẩu, xóa tài khoản (GDPR), đăng nhập Google/Facebook, 2FA.

> Lưu ý: Các luồng OTP và quy tắc mật khẩu mạnh (≥ 8 ký tự) mô tả ở trên là thiết kế mục tiêu cho giai đoạn sau. Mã nguồn hiện tại yêu cầu mật khẩu tối thiểu 6 ký tự và kích hoạt tài khoản tức thì.

## Ghi chú

- Khách có thể lưu tối đa 5 địa chỉ.
- Hệ thống tự động đề xuất địa chỉ khi đặt hàng dựa trên lịch sử.
- Khách có thể sử dụng tài khoản xã hội (Google, Facebook) để đăng nhập nhanh.
- Hệ thống nên gửi email hàng tháng với lời nhắc cập nhật mật khẩu để bảo mật.
