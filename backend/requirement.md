# Hệ thống quản lí bán hàng Laptop

> Website quản lí bán hàng laptop toàn diện — từ nhập kho, bán hàng POS, đến báo cáo doanh thu.
> Stack: **React + Vite** (Frontend) · **Node.js + Express** (Backend) · **PostgreSQL + Prisma** (Database)

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Các phân hệ chức năng](#các-phân-hệ-chức-năng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tech stack & thư viện](#tech-stack--thư-viện)
- [Thiết kế Database](#thiết-kế-database)
- [API Endpoints](#api-endpoints)
- [Phân quyền người dùng](#phân-quyền-người-dùng)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Triển khai (DevOps)](#triển-khai-devops)

---

## Tổng quan

Hệ thống được xây dựng theo mô hình **3-tier architecture**:

```
Client (React)  ←→  Server (Node.js/Express)  ←→  Database (PostgreSQL)
```

### Tính năng nổi bật

- Quản lí sản phẩm laptop theo **serial number** từng máy
- Bán hàng **POS** trực tiếp tại quầy, in hóa đơn nhiệt
- Quản lí **kho hàng** theo lô nhập, cảnh báo tồn kho thấp
- **Bảo hành** tra cứu theo serial, lưu lịch sử sửa chữa
- Báo cáo **doanh thu / lợi nhuận** theo ngày, tháng, nhân viên
- Phân quyền 3 cấp: Admin · Quản lí · Nhân viên bán hàng
- Thông báo **realtime** khi có đơn hàng mới (Socket.io)
- Xuất báo cáo **Excel / PDF**
- Thanh toán **VNPay / MoMo** tích hợp

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│              React + Vite · TanStack Query · Zustand        │
│         shadcn/ui + Tailwind · React Router v6              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                        SERVER LAYER                         │
│              Node.js + Express · JWT Auth                   │
│         Controllers → Services → Prisma ORM                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    PostgreSQL          Redis           Cloudinary
   (dữ liệu chính)    (cache)         (ảnh sản phẩm)
```

---

## Các phân hệ chức năng

### 1. Quản lí sản phẩm

- Thêm / sửa / xóa laptop với đầy đủ thông số kĩ thuật (CPU, RAM, ổ cứng, màn hình, card đồ họa, thương hiệu)
- Upload nhiều ảnh sản phẩm (Cloudinary)
- Phân loại theo danh mục, thương hiệu, khoảng giá
- Tìm kiếm và lọc nâng cao
- Quản lí giá nhập / giá bán / giá khuyến mãi

### 2. Quản lí kho

- Nhập hàng theo lô, gắn serial number từng máy
- Xuất kho khi bán hàng, tự động trừ tồn
- Kiểm kê kho định kì
- Cảnh báo khi tồn kho thấp hơn ngưỡng cài đặt
- Lịch sử nhập / xuất từng sản phẩm

### 3. Bán hàng & POS

- Tạo đơn hàng nhanh tại quầy
- Thanh toán tiền mặt, chuyển khoản, VNPay, MoMo
- Chiết khấu theo % hoặc số tiền cố định
- Đổi trả hàng, hoàn tiền
- In hóa đơn nhiệt (thermal printer)
- Xuất hóa đơn PDF gửi email khách

### 4. Quản lí khách hàng

- Hồ sơ khách hàng: thông tin liên hệ, địa chỉ
- Lịch sử mua hàng toàn bộ
- Phân hạng khách hàng (Thường / Bạc / Vàng / VIP)
- Tích điểm, đổi điểm giảm giá
- Tìm kiếm nhanh theo SĐT / tên / email

### 5. Bảo hành

- Tra cứu bảo hành theo serial number
- Thời hạn bảo hành tự động tính từ ngày bán
- Tiếp nhận yêu cầu bảo hành / sửa chữa
- Lưu lịch sử sửa chữa từng máy
- In phiếu bảo hành

### 6. Nhà cung cấp

- Danh sách nhà cung cấp, thông tin liên hệ
- Tạo đơn đặt hàng nhập
- Theo dõi công nợ nhà cung cấp
- Lịch sử giao dịch theo từng NCC

### 7. Báo cáo & thống kê

- Doanh thu theo ngày / tuần / tháng / quý / năm
- Lợi nhuận gộp (doanh thu - giá vốn)
- Top sản phẩm bán chạy
- Hiệu suất từng nhân viên (doanh số, hoa hồng)
- Tồn kho theo từng sản phẩm
- Xuất báo cáo Excel / PDF

### 8. Nhân sự & phân quyền

- 3 vai trò: Admin / Quản lí / Nhân viên
- Quản lí ca làm việc
- Tính hoa hồng theo doanh số
- Nhật kí hoạt động (audit log)

---

## Cấu trúc thư mục

### Frontend

```
frontend/
├── public/
├── src/
│   ├── api/                    # Axios instances & API calls
│   │   ├── axiosClient.js
│   │   ├── products.api.js
│   │   ├── orders.api.js
│   │   ├── customers.api.js
│   │   ├── inventory.api.js
│   │   └── auth.api.js
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── layout/             # Sidebar, Header, Layout wrapper
│   │   └── shared/             # Reusable: Table, Modal, Badge...
│   ├── pages/
│   │   ├── auth/               # Login
│   │   ├── dashboard/          # Tổng quan
│   │   ├── products/           # DS sản phẩm, thêm/sửa
│   │   ├── inventory/          # Kho hàng, nhập hàng
│   │   ├── pos/                # Bán hàng tại quầy
│   │   ├── orders/             # Danh sách đơn hàng
│   │   ├── customers/          # Khách hàng
│   │   ├── warranty/           # Bảo hành
│   │   ├── suppliers/          # Nhà cung cấp
│   │   ├── reports/            # Báo cáo
│   │   └── settings/           # Cài đặt hệ thống
│   ├── store/                  # Zustand stores
│   │   ├── authStore.js
│   │   ├── cartStore.js        # Giỏ hàng POS
│   │   └── uiStore.js
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Helpers, formatters
│   ├── constants/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js               # Prisma client
│   │   └── redis.js
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Xác thực JWT
│   │   ├── role.middleware.js   # Kiểm tra quyền
│   │   └── error.middleware.js  # Xử lí lỗi chung
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.route.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── products/
│   │   │   ├── product.route.js
│   │   │   ├── product.controller.js
│   │   │   └── product.service.js
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── warranty/
│   │   ├── suppliers/
│   │   ├── reports/
│   │   └── users/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── utils/
│   │   ├── pdf.js              # PDFKit
│   │   ├── excel.js            # ExcelJS
│   │   ├── email.js            # Nodemailer
│   │   └── vnpay.js            # VNPay helper
│   └── app.js
├── .env
└── package.json
```

---

## Tech stack & thư viện

### Frontend

| Thư viện         | Phiên bản | Mục đích                        |
| ---------------- | --------- | ------------------------------- |
| React            | 18+       | UI framework                    |
| Vite             | 5+        | Build tool, dev server          |
| React Router v6  | 6+        | Điều hướng trang                |
| TanStack Query   | 5+        | Fetch, cache, sync server state |
| Zustand          | 4+        | Global client state             |
| Axios            | 1+        | HTTP client                     |
| shadcn/ui        | latest    | UI component library            |
| Tailwind CSS     | 3+        | Utility CSS                     |
| Recharts         | 2+        | Biểu đồ doanh thu               |
| React Hook Form  | 7+        | Quản lí form                    |
| Zod              | 3+        | Validate schema                 |
| react-to-print   | 2+        | In hóa đơn                      |
| date-fns         | 3+        | Xử lí ngày tháng                |
| Socket.io-client | 4+        | Nhận thông báo realtime         |

### Backend

| Thư viện             | Phiên bản | Mục đích                 |
| -------------------- | --------- | ------------------------ |
| Express.js           | 4+        | HTTP server              |
| Prisma ORM           | 5+        | Database access layer    |
| PostgreSQL           | 15+       | Cơ sở dữ liệu chính      |
| Redis                | 7+        | Cache                    |
| jsonwebtoken         | 9+        | JWT access/refresh token |
| bcrypt               | 5+        | Hash password            |
| Multer               | 1+        | Upload file              |
| Cloudinary SDK       | 1+        | Lưu trữ ảnh              |
| Socket.io            | 4+        | Realtime notifications   |
| ExcelJS              | 4+        | Xuất báo cáo Excel       |
| PDFKit               | 0.15+     | Xuất hóa đơn PDF         |
| Nodemailer           | 6+        | Gửi email                |
| node-thermal-printer | 4+        | In hóa đơn nhiệt         |
| helmet               | 7+        | Bảo mật HTTP headers     |
| cors                 | 2+        | Cấu hình CORS            |
| express-rate-limit   | 7+        | Giới hạn request         |
| winston              | 3+        | Logging                  |

---

## Thiết kế Database

### Các bảng chính (Prisma Schema)

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(STAFF)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  orders    Order[]
}

enum Role {
  ADMIN
  MANAGER
  STAFF
}

model Product {
  id          String      @id @default(uuid())
  name        String
  slug        String      @unique
  brand       String
  cpu         String
  ram         String
  storage     String
  display     String
  gpu         String?
  price       Float
  costPrice   Float
  images      String[]
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id])
  serials     Serial[]
  createdAt   DateTime    @default(now())
}

model Serial {
  id          String    @id @default(uuid())
  code        String    @unique
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  status      SerialStatus @default(IN_STOCK)
  importId    String
  import      Import    @relation(fields: [importId], references: [id])
  soldAt      DateTime?
  warranty    Warranty?
}

enum SerialStatus {
  IN_STOCK
  SOLD
  WARRANTY
  RETURNED
}

model Order {
  id          String      @id @default(uuid())
  code        String      @unique
  customerId  String?
  customer    Customer?   @relation(fields: [customerId], references: [id])
  staffId     String
  staff       User        @relation(fields: [staffId], references: [id])
  items       OrderItem[]
  total       Float
  discount    Float       @default(0)
  payMethod   PayMethod
  status      OrderStatus @default(COMPLETED)
  createdAt   DateTime    @default(now())
}

model Customer {
  id        String   @id @default(uuid())
  name      String
  phone     String   @unique
  email     String?
  address   String?
  tier      Tier     @default(REGULAR)
  points    Int      @default(0)
  orders    Order[]
}

model Warranty {
  id         String   @id @default(uuid())
  serialId   String   @unique
  serial     Serial   @relation(fields: [serialId], references: [id])
  startDate  DateTime
  endDate    DateTime
  notes      String?
  repairs    Repair[]
}
```

---

## API Endpoints

### Auth

```
POST   /api/auth/login          Đăng nhập
POST   /api/auth/logout         Đăng xuất
POST   /api/auth/refresh        Làm mới access token
GET    /api/auth/me             Thông tin user hiện tại
```

### Sản phẩm

```
GET    /api/products            Danh sách sản phẩm (filter, search, paginate)
GET    /api/products/:id        Chi tiết sản phẩm
POST   /api/products            Thêm sản phẩm mới
PUT    /api/products/:id        Cập nhật sản phẩm
DELETE /api/products/:id        Xóa sản phẩm
POST   /api/products/:id/images Upload ảnh
```

### Kho hàng

```
GET    /api/inventory           Tồn kho hiện tại
GET    /api/inventory/imports   Lịch sử nhập hàng
POST   /api/inventory/imports   Tạo phiếu nhập hàng
GET    /api/serials/:code       Tra cứu serial number
```

### Đơn hàng

```
GET    /api/orders              Danh sách đơn hàng
GET    /api/orders/:id          Chi tiết đơn hàng
POST   /api/orders              Tạo đơn hàng mới (POS)
PATCH  /api/orders/:id/cancel   Hủy đơn
POST   /api/orders/:id/return   Đổi trả hàng
GET    /api/orders/:id/invoice  Xuất hóa đơn PDF
```

### Khách hàng

```
GET    /api/customers           Danh sách khách hàng
GET    /api/customers/:id       Hồ sơ + lịch sử mua
POST   /api/customers           Thêm khách hàng
PUT    /api/customers/:id       Cập nhật thông tin
GET    /api/customers/search?q= Tìm theo tên / SĐT
```

### Bảo hành

```
GET    /api/warranty/:serial    Tra cứu bảo hành
POST   /api/warranty/repair     Tiếp nhận bảo hành
PUT    /api/warranty/repair/:id Cập nhật trạng thái sửa
```

### Báo cáo

```
GET    /api/reports/revenue     Báo cáo doanh thu
GET    /api/reports/profit      Báo cáo lợi nhuận
GET    /api/reports/top-products Top sản phẩm bán chạy
GET    /api/reports/staff       Hiệu suất nhân viên
GET    /api/reports/inventory   Báo cáo tồn kho
GET    /api/reports/export      Xuất Excel/PDF
```

### Thanh toán

```
POST   /api/payment/vnpay/create    Tạo link thanh toán VNPay
GET    /api/payment/vnpay/return    Callback VNPay
POST   /api/payment/momo/create     Tạo link thanh toán MoMo
POST   /api/payment/momo/callback   Callback MoMo
```

---

## Phân quyền người dùng

| Chức năng             | Admin | Quản lí | Nhân viên |
| --------------------- | :---: | :-----: | :-------: |
| Xem dashboard         |  ✅   |   ✅    |    ✅     |
| Bán hàng POS          |  ✅   |   ✅    |    ✅     |
| Thêm / sửa sản phẩm   |  ✅   |   ✅    |    ❌     |
| Xóa sản phẩm          |  ✅   |   ❌    |    ❌     |
| Nhập kho              |  ✅   |   ✅    |    ❌     |
| Xem báo cáo doanh thu |  ✅   |   ✅    |    ❌     |
| Xem báo cáo toàn bộ   |  ✅   |   ✅    |    ❌     |
| Quản lí nhân viên     |  ✅   |   ❌    |    ❌     |
| Cài đặt hệ thống      |  ✅   |   ❌    |    ❌     |
| Hủy đơn hàng          |  ✅   |   ✅    |    ❌     |
| Đổi trả hàng          |  ✅   |   ✅    |    ✅     |

---

## Hướng dẫn cài đặt

### Yêu cầu

- Node.js >= 18
- PostgreSQL >= 15
- Redis >= 7
- pnpm hoặc npm

### 1. Clone repository

```bash
git clone https://github.com/your-org/laptop-sales.git
cd laptop-sales
```

### 2. Cài đặt Backend

```bash
cd backend
npm install

# Sao chép file env
cp .env.example .env
# Cập nhật các biến môi trường trong .env

# Chạy migration database
npx prisma migrate dev

# Seed dữ liệu mẫu (tùy chọn)
npx prisma db seed

# Khởi động dev server
npm run dev
```

### 3. Cài đặt Frontend

```bash
cd frontend
npm install

# Sao chép file env
cp .env.example .env
# Cập nhật VITE_API_URL

# Khởi động dev server
npm run dev
```

### 4. Truy cập

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- API docs (nếu có Swagger): `http://localhost:3000/api-docs`

---

## Biến môi trường

### Backend `.env`

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/laptop_sales"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/payment/vnpay/return

# MoMo
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## Triển khai (DevOps)

### Docker Compose

```yaml
version: "3.8"

services:
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file: ./backend/.env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: laptop_sales
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

volumes:
  pgdata:
```

### Tùy chọn triển khai

| Dịch vụ         | Frontend         | Backend          | Database           |
| --------------- | ---------------- | ---------------- | ------------------ |
| **Miễn phí**    | Vercel / Netlify | Railway / Render | Supabase           |
| **Trả phí nhẹ** | Cloudflare Pages | Railway Pro      | Railway PostgreSQL |
| **Tự quản lí**  | VPS Nginx        | VPS PM2          | VPS PostgreSQL     |

### Lệnh production

```bash
# Backend
npm run build
npm start          # hoặc: pm2 start ecosystem.config.js

# Frontend
npm run build      # output: dist/
# Deploy thư mục dist/ lên Nginx / Vercel / Netlify
```

---

## Roadmap

- [ ] Phân hệ bán hàng online (tích hợp Shopee / Lazada API)
- [ ] App mobile cho nhân viên (React Native)
- [ ] Barcode scanner hỗ trợ nhập kho nhanh
- [ ] Tích hợp phần mềm kế toán (MISA)
- [ ] Multi-branch: quản lí nhiều chi nhánh
- [ ] Dashboard analytics nâng cao (AI gợi ý nhập hàng)

---

_Được xây dựng với React + Node.js · Phiên bản 1.0.0_
