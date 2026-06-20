# Ghi chú triển khai: UC-15 — Đánh giá & Bình luận Sản phẩm

Tài liệu này mô tả phần code đã được bổ sung để hoàn thiện **UC-15 (usecase13.md)** — chức năng đánh giá sao và bình luận sản phẩm cho khách hàng. Đây là use case duy nhất trong toàn bộ tài liệu `.md` chưa có code; các use case còn lại (UC-01 → UC-14) đã có sẵn controller, API và giao diện.

## Backend (ASP.NET Core)

| File | Mô tả |
| ---- | ----- |
| `backend/Models/ProductReview.cs` | Thực thể đánh giá: số sao (1-5), tiêu đề, nội dung, cờ "đã mua hàng" (verified purchase), cờ ẩn (soft hide), số lượt hữu ích. |
| `backend/Data/AppDbContext.cs` | Đăng ký `DbSet<ProductReview>` và cấu hình quan hệ + index. |
| `backend/Controllers/ReviewsController.cs` | Toàn bộ API của UC-15 (xem bảng endpoint bên dưới). |
| `backend/Migrations/20260620150000_AddProductReviews.cs` (+ `.Designer.cs`) | Migration tạo bảng `ProductReviews`. |
| `backend/Migrations/AppDbContextModelSnapshot.cs` | Cập nhật snapshot khớp với model mới. |
| `backend/Services/DatabaseSeeder.cs` | Gieo một vài đánh giá mẫu. |

### Các endpoint API

| Method | Route | Quyền | Chức năng |
| ------ | ----- | ----- | --------- |
| GET | `/api/reviews/product/{productId}` | Public | Danh sách đánh giá + trung bình sao + phân bố + sắp xếp (`helpful`/`newest`/`highest`/`lowest`) + lọc theo sao |
| GET | `/api/reviews/product/{productId}/summary` | Public | Tóm tắt nhanh (trung bình sao, tổng số) cho trang danh sách |
| GET | `/api/reviews/product/{productId}/eligibility` | customer | Kiểm tra khách có quyền đánh giá (đã mua) và đã đánh giá chưa |
| POST | `/api/reviews` | customer | Gửi đánh giá mới (bắt buộc đã mua + đã giao) |
| PUT | `/api/reviews/{id}` | customer | Sửa đánh giá của chính mình |
| DELETE | `/api/reviews/{id}` | customer | Xóa đánh giá của chính mình |
| POST | `/api/reviews/{id}/helpful` | Public | Tăng lượt "Hữu ích" |
| GET | `/api/reviews/admin/all` | admin | Xem tất cả đánh giá (kể cả đã ẩn) để kiểm duyệt |
| PUT | `/api/reviews/{id}/visibility` | admin | Ẩn / hiện lại bình luận không phù hợp |

### Quy tắc nghiệp vụ đã hiện thực
- Chỉ khách **đã mua** sản phẩm (đơn ở trạng thái `Delivered` hoặc `Confirmed`) mới được đánh giá.
- Mỗi khách chỉ có **1 đánh giá / sản phẩm** (lần sau là chỉnh sửa).
- Gắn nhãn **✓ Đã mua hàng** (verified purchase).
- Bộ lọc từ ngữ không phù hợp đơn giản (chống spam).
- Admin **ẩn mềm** (soft hide) thay vì xóa để giữ audit.

## Frontend (Next.js + TypeScript)

| File | Mô tả |
| ---- | ----- |
| `frontend/lib/api.ts` | Thêm các hàm gọi API đánh giá. |
| `frontend/pages/product/[id].tsx` | Trang chi tiết sản phẩm + giao diện đánh giá đầy đủ (chọn sao, biểu đồ phân bố, sắp xếp/lọc, viết/sửa/xóa, nút hữu ích). |
| `frontend/pages/reviews.tsx` | Trang kiểm duyệt đánh giá cho Admin. |
| `frontend/pages/customer.tsx` | Thêm link "Chi tiết & Đánh giá" ở thẻ sản phẩm và link "[Đánh giá]" trong lịch sử đơn đã giao. |
| `frontend/pages/admin.tsx` | Thêm thẻ "KIỂM DUYỆT ĐÁNH GIÁ". |
| `frontend/styles/globals.css` | CSS cho sao và biểu đồ đánh giá. |

## Cách chạy lại
Các thư mục build (`node_modules`, `.next`, `bin`, `obj`) đã được loại bỏ để giảm dung lượng. Khôi phục theo README:

```
# Backend
cd backend && dotnet restore && dotnet run

# Frontend
cd frontend && npm install && npm run dev
```

Khi backend khởi động, `Database.Migrate()` sẽ tự áp dụng migration `AddProductReviews` để tạo bảng `ProductReviews`.

> Lưu ý: Frontend đã được kiểm tra `next build` thành công (21 trang). Backend chưa thể biên dịch trong môi trường đóng gói do thiếu .NET SDK; code được rà soát thủ công để khớp đúng cấu trúc dự án hiện có.
