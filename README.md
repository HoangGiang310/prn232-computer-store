# Computer Store Project

## Cấu trúc

- `backend/`: ASP.NET Core API với C#, Entity Framework Core, PostgreSQL và JWT.
- `frontend/`: Next.js + TypeScript cho web admin, staff, customer.
- `mobile/`: Flutter app cho khách hàng đặt online.

## Khởi động nhanh

### Backend

1. Cài .NET 8 SDK.
2. Cập nhật kết nối PostgreSQL trong `backend/appsettings.json`.
3. Mở terminal tại `backend` và chạy:
   - `dotnet restore`
   - `dotnet run`

### Frontend

1. Mở terminal tại `frontend` và chạy:
   - `npm install`
   - `npm run dev`

### Mobile

1. Cài Flutter SDK.
2. Mở terminal tại `mobile` và chạy:
   - `flutter pub get`
   - `flutter run`

## Lưu ý

- Backend sử dụng một API server duy nhất cho các role `admin`, `sales`, `accountant`, `warehouse`, `customer`.
- Web Next.js có thể triển khai trên Vercel.
- Backend có thể deploy trên Render.
