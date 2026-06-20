# Ghi chú sửa lỗi: Không tạo / chỉnh sửa được dữ liệu + Bổ sung Validation

## Nguyên nhân lỗi

Backend dùng `<Nullable>enable</Nullable>` và `[ApiController]`. Với cấu hình này, .NET 8 **tự động coi mọi thuộc tính kiểu reference không-nullable là `[Required]`** khi kiểm tra model. Vì các Entity có **navigation property** không-nullable (ví dụ `Product.Images`, `Order.OrderItems`, `Order.Customer`, `Order.Shipment`) và các trường như `User.PasswordHash`, khi frontend gửi payload tạo/sửa (không kèm các trường này) thì model bị coi là **không hợp lệ → trả về lỗi 400** → không tạo/sửa được sản phẩm, khách hàng, nhân viên, voucher, đơn hàng.

## Cách khắc phục

### 1. Tắt "implicit required" cho non-nullable reference (sửa gốc, áp dụng toàn hệ thống)
`backend/Program.cs`:
```csharp
builder.Services.AddControllers(options =>
{
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
})
```
→ Chỉ những trường có `[Required]` tường minh hoặc ràng buộc trong DTO mới bị validate. Navigation property không còn bị bắt buộc. Sửa được tất cả endpoint tạo/sửa (kể cả tạo đơn hàng).

### 2. Dùng DTO + Validation cho các CRUD chính
Tạo các DTO chỉ chứa trường client gửi lên, kèm thông báo lỗi tiếng Việt rõ ràng:

| DTO | Dùng cho | Validation tiêu biểu |
| --- | -------- | -------------------- |
| `ProductDto` | Tạo/sửa sản phẩm | Bắt buộc mã/tên/hãng/cấu hình; giá & tồn kho ≥ 0; giá bán ≥ giá nhập; chống trùng mã |
| `CustomerDto` | Tạo/sửa khách hàng | Bắt buộc họ tên; số điện thoại đúng định dạng (0xxxxxxxxx); email hợp lệ |
| `CreateUserDto` / `UpdateUserDto` | Tạo/sửa nhân viên | Username 3-50 ký tự; vai trò hợp lệ; email hợp lệ & không trùng; mật khẩu ≥ 6 ký tự |
| `CreateVoucherDto` / `UpdateVoucherDto` | Tạo/sửa voucher | Loại giảm giá hợp lệ; giá trị > 0; % không vượt 100; ngày kết thúc > ngày bắt đầu; chống trùng mã |

Các controller `ProductsController`, `CustomersController`, `UsersController`, `VouchersController` đã được viết lại để nhận DTO và map sang Entity.

### 3. Validation phía client + hiển thị lỗi rõ ràng
- `frontend/lib/api.ts`: thêm hàm `extractApiError()` đọc được cả lỗi nghiệp vụ (`{ message }`) lẫn lỗi validation của ASP.NET (`{ errors: { Field: [...] } }`), áp dụng cho toàn bộ wrapper.
- `frontend/pages/products.tsx`: thêm kiểm tra phía client trước khi gửi (bắt buộc trường, giá không âm, giá bán ≥ giá nhập...).

## Kiểm thử
- Frontend: `next build` thành công, TypeScript không lỗi (21 trang).
- Backend: rà soát thủ công (không có .NET SDK trong môi trường đóng gói). Cân bằng cú pháp, DTO đúng namespace, controller dùng đúng DTO.

## Sau khi giải nén
```
# Backend
cd backend && dotnet restore && dotnet run --urls "http://localhost:5000"

# Frontend
cd frontend && npm install && npm run dev
```
