# Ghi chú áp dụng DESIGN.md vào code (Frontend + Mobile)

Tài liệu này tóm tắt các thay đổi đã thực hiện để đưa design system
"Vibrant Marketplace" trong `DESIGN.md` vào code thật của `frontend/`
(Next.js) và `mobile/` (Flutter), và cách áp dụng tiếp cho các trang
chưa được chỉnh tay.

## 1. Frontend (Next.js) — `frontend/styles/globals.css`

- Thêm khối `:root` design tokens ở đầu file (màu, typography, radius,
  spacing) đúng theo `DESIGN.md`, cộng font Inter qua Google Fonts.
- Thêm bộ class dùng chung: `.btn-primary / .btn-secondary / .btn-ghost`,
  `.mkt-product-card`, `.mkt-price`, `.mkt-chip`, `.mkt-input`,
  `.mkt-surface-card` — dùng cho các trang mới hoặc khi refactor trang cũ.
- Đổi toàn bộ màu thương hiệu cũ (tím/indigo `#4338ca`, `#6366f1`...)
  sang tông đỏ-cam marketplace (`#EE4D2D` primary, `#B22204` primary-dark,
  `#FFBA3F` tertiary gold) — áp dụng xuyên suốt file vì các màu này được
  tái sử dụng ở rất nhiều nơi (nav, button, focus state, badge...).
- Bo góc: chuẩn hoá các `border-radius` lớn (16–24px, bo tròn "pill" cho
  nút) về thang bo góc của design system (`4px` mặc định, `8px` cho card
  lớn, `9999px` chỉ dùng cho badge/chip).
- Header (`.store-nav`, `.store-search-*`) được vẽ lại theo phong cách
  marketplace: nền đỏ đậm, thanh tìm kiếm bo góc vuông 4px, nút tìm màu
  vàng gold.
- **Quan trọng:** file có một khối "GLOBAL POLISH LAYER" ở cuối file
  (khai báo lại `:root` với các biến cục bộ `--brand`, `--ink`, `--line`,
  `--bg`, `--radius`, `--shadow-*`). Khối này thắng cascade cho phần lớn
  `.button`, input, `.card`, `.shop-card`, `.pdp-*`... nên đã được retheme
  lại đồng bộ — đây là đòn bẩy chính giúp hầu hết các trang (kể cả admin)
  tự động đổi theo tông màu mới mà không cần sửa từng trang.

### Cách áp dụng tiếp cho từng trang còn lại
Hầu hết các trang (`products.tsx`, `checkout.tsx`, `admin.tsx`,
`inventory.tsx`, `orders.tsx`, ...) dùng lại các class chung
(`.card`, `.button`, `.shop-card`, `input`, `select`...) nên đã tự động
đổi màu/bo góc theo token mới. Nếu muốn nâng cấp thêm một trang cụ thể
(ví dụ đưa `products.tsx` lên đúng "product card" 1:1 ratio + badge như
mockup), hãy:
1. Dùng các class `.mkt-product-card`, `.mkt-price`, `.mkt-chip` đã có
   sẵn trong `globals.css` thay vì viết CSS mới.
2. Ưu tiên biến (`var(--primary)`, `var(--border-subtle)`,
   `var(--radius)`...) thay vì hex cứng để đồng bộ toàn hệ thống.

## 2. Mobile (Flutter) — `mobile/lib/theme/app_theme.dart`

- Tạo file theme trung tâm `AppTheme.light`, map đầy đủ màu, typography,
  bo góc, khoảng cách từ `DESIGN.md` sang `ColorScheme` / `TextTheme` /
  `ElevatedButtonTheme` / `InputDecorationTheme` / `ChipTheme` /
  `AppBarTheme`... của Flutter.
- Wire theme này vào `MaterialApp` trong `main.dart`
  (`theme: AppTheme.light`).
- Quét và thay toàn bộ mã màu hex cứng (`0xFF1D4ED8` xanh dương cũ,
  `0xFF0F172A` navy...) trong `mobile/lib/screens/*.dart` sang bảng màu
  marketplace mới (đỏ-cam `0xFFEE4D2D`, `0xFFB22204`, vàng gold
  `0xFFFFBA3F`, xám `0xFF757575`/`0xFFE8E8E8`...). Các màn hình
  không có mã hex cứng (đa phần màn hình admin/staff như
  `inventory_screen.dart`, `orders_screen.dart`, `reports_screen.dart`...)
  đã tự động ăn theo `AppTheme.light` vì chúng dùng theme mặc định của
  Flutter (`Theme.of(context)`, `ElevatedButton`, `TextField` không custom
  style).

### Cách áp dụng tiếp
- Với các widget dùng `Color(0xFF...)` mới thêm sau này, hãy dùng hằng số
  trong `AppColors` (ví dụ `AppColors.primary`, `AppColors.textSecondary`)
  thay vì hex cứng.
- Với giá tiền, dùng `AppTheme.priceDisplay` / `AppTheme.priceDisplaySmall`
  / `AppTheme.priceOriginal` để đồng bộ với `price-display` token trong
  `DESIGN.md`.
- `AppRadius.md` (4px) là bo góc mặc định cho nút/input/card theo đúng
  spec "Buttons/Cards maintain 4px radius".

## 3. Việc chưa làm (do phạm vi rất lớn)

Đây là bản nền tảng (tokens + theme + các trang/màn hình cốt lõi:
header, trang chủ, giỏ hàng, đăng nhập, danh sách & chi tiết sản phẩm).
Một vài chi tiết nhỏ (bo góc 10–14px lẻ tẻ ở vài badge/thumbnail phụ)
chưa được chuẩn hoá 100% vì không ảnh hưởng nhiều đến tổng thể. Nếu cần
rà soát pixel-perfect toàn bộ ~20 trang frontend + ~15 màn hình mobile,
nên làm theo từng nhóm màn hình (customer / admin) trong các lượt sau.
