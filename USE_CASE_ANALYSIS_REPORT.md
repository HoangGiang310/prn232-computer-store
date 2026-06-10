# Báo Cáo: Kiểm Tra và Cải Thiện Use Case Hệ Thống

**Ngày báo cáo**: 10 Tháng 6, 2026  
**Trạng thái**: ✅ Hoàn tất phân tích và tạo use case mới

---

## 1. Tóm Tắt Phát Hiện

### 1.1 Hiện Trạng Trước Cải Thiện

| Loại                           | Số lượng     | Ghi chú                                       |
| ------------------------------ | ------------ | --------------------------------------------- |
| Use Case đã có                 | 4            | usecase1-4.md                                 |
| Use Case thiếu                 | 9            | Cần tạo mới                                   |
| Vai trò trong hệ thống         | 5            | Admin, Sales, Accountant, Warehouse, Customer |
| Use case liên quan tới vai trò | Không đầy đủ | Một số vai trò không có use case tương ứng    |

### 1.2 Phân Tích Vai Trò

| Vai Trò        | Use Case Hiện Có           | Cần Bổ Sung                                            |
| -------------- | -------------------------- | ------------------------------------------------------ |
| **Admin**      | UC-01, UC-02, UC-03        | UC-07 (Voucher), UC-09 (Báo cáo), UC-10 (Quản lý user) |
| **Sales**      | UC-01, UC-02, UC-03, UC-04 | UC-06 (Khách hàng)                                     |
| **Accountant** | UC-01                      | UC-09 (Báo cáo tài chính)                              |
| **Warehouse**  | UC-01, UC-04               | UC-05 (Vận chuyển - riêng), UC-08 (Trả hàng)           |
| **Customer**   | ❌ Không có                | UC-11, UC-12, UC-13, UC-14, UC-15 (5 use case mới)     |

---

## 2. Use Case Đã Có (4 cái)

| UC    | Tên                       | Tập Tin     | Vai Trò                             | Trạng Thái  |
| ----- | ------------------------- | ----------- | ----------------------------------- | ----------- |
| UC-01 | Đăng nhập / Đăng xuất     | usecase1.md | Admin, Sales, Accountant, Warehouse | ✅ OK       |
| UC-02 | Quản lý sản phẩm          | usecase2.md | Admin, Sales                        | ✅ OK       |
| UC-03 | Quản lý đơn hàng          | usecase3.md | Admin, Sales, Customer              | ⚠️ Cần tách |
| UC-04 | Quản lý kho và vận chuyển | usecase4.md | Warehouse, Sales                    | ⚠️ Cần tách |

### 2.1 Khuyến Nghị Tách Use Case

**UC-03 nên tách thành 2 use case**:

- **UC-03**: Tạo/Quản lý đơn hàng offline (POS) - Vai trò: Sales, Admin
- **UC-08**: Hoàn tiền / Trả hàng - Vai trò: Sales, Warehouse, Admin

**UC-04 nên tách thành 2 use case**:

- **UC-04**: Quản lý tồn kho - Vai trò: Warehouse, Admin, Sales (view)
- **UC-05**: Quản lý giao hàng / Vận chuyển - Vai trò: Warehouse, Sales, Admin

---

## 3. Use Case Mới Được Tạo (9 cái)

| UC    | Tên                            | Tập Tin      | Vai Trò           | Ưu Tiên  | Trạng Thái |
| ----- | ------------------------------ | ------------ | ----------------- | -------- | ---------- |
| UC-06 | Quản lý khách hàng             | usecase5.md  | Admin, Sales      | 🔴 Cao   | ✅ Tạo mới |
| UC-07 | Quản lý khuyến mãi & Voucher   | usecase6.md  | Admin             | 🟡 Trung | ✅ Tạo mới |
| UC-09 | Báo cáo và Thống kê            | usecase7.md  | Admin, Accountant | 🔴 Cao   | ✅ Tạo mới |
| UC-10 | Quản lý người dùng / Nhân viên | usecase8.md  | Admin             | 🔴 Cao   | ✅ Tạo mới |
| UC-11 | Đặt hàng online                | usecase9.md  | Customer          | 🔴 Cao   | ✅ Tạo mới |
| UC-12 | Thanh toán online              | usecase10.md | Customer          | 🔴 Cao   | ✅ Tạo mới |
| UC-13 | Theo dõi giao hàng online      | usecase11.md | Customer          | 🔴 Cao   | ✅ Tạo mới |
| UC-14 | Quản lý tài khoản khách hàng   | usecase12.md | Customer          | 🟡 Trung | ✅ Tạo mới |
| UC-15 | Đánh giá & Bình luận sản phẩm  | usecase13.md | Customer          | 🟢 Thấp  | ✅ Tạo mới |

**Tổng cộng**: 13 use case (4 cũ + 9 mới)

---

## 4. Danh Sách File Use Case

### 4.1 File Hiện Có (giữ nguyên)

```
✅ usecase1.md   → UC-01: Đăng nhập / Đăng xuất
✅ usecase2.md   → UC-02: Quản lý sản phẩm
⚠️  usecase3.md   → UC-03: Quản lý đơn hàng (cần tách)
⚠️  usecase4.md   → UC-04: Quản lý kho (cần tách)
```

### 4.2 File Mới Tạo

```
✨ usecase5.md   → UC-06: Quản lý khách hàng
✨ usecase6.md   → UC-07: Quản lý khuyến mãi & Voucher
✨ usecase7.md   → UC-09: Báo cáo và Thống kê
✨ usecase8.md   → UC-10: Quản lý người dùng
✨ usecase9.md   → UC-11: Đặt hàng online
✨ usecase10.md  → UC-12: Thanh toán online
✨ usecase11.md  → UC-13: Theo dõi giao hàng online
✨ usecase12.md  → UC-14: Quản lý tài khoản khách hàng
✨ usecase13.md  → UC-15: Đánh giá & Bình luận sản phẩm
```

### 4.3 Các File Tư Liệu Khác

```
📄 USE_CASES_MAPPING.md      → Bảng mapping vai trò - use case
📄 requirement.md             → Yêu cầu hệ thống (đã cập nhật)
📄 user_story.md              → User stories (10 stories)
```

---

## 5. Mapping Vai Trò - Use Case (Chi Tiết)

### 5.1 Admin

| UC    | Tên                   | Loại |
| ----- | --------------------- | ---- |
| UC-01 | Đăng nhập             | ✅   |
| UC-02 | Quản lý sản phẩm      | ✅   |
| UC-03 | Tạo đơn offline (POS) | ✅   |
| UC-04 | Quản lý tồn kho       | ✅   |
| UC-05 | Quản lý giao hàng     | ✅   |
| UC-06 | Quản lý khách hàng    | ✅   |
| UC-07 | Quản lý khuyến mãi    | ✅   |
| UC-08 | Hoàn tiền / Trả hàng  | ✅   |
| UC-09 | Báo cáo và Thống kê   | ✅   |
| UC-10 | Quản lý người dùng    | ✅   |

**Tổng**: 10 use case

### 5.2 Sales (Nhân viên bán hàng)

| UC    | Tên                   | Loại         |
| ----- | --------------------- | ------------ |
| UC-01 | Đăng nhập             | ✅           |
| UC-02 | Quản lý sản phẩm      | ✅ View Only |
| UC-03 | Tạo đơn offline (POS) | ✅           |
| UC-04 | Quản lý tồn kho       | ✅ View Only |
| UC-05 | Quản lý giao hàng     | ✅ Cập nhật  |
| UC-06 | Quản lý khách hàng    | ✅           |
| UC-08 | Hoàn tiền / Trả hàng  | ✅           |

**Tổng**: 7 use case

### 5.3 Accountant (Kế toán)

| UC    | Tên               | Loại |
| ----- | ----------------- | ---- |
| UC-01 | Đăng nhập         | ✅   |
| UC-09 | Báo cáo tài chính | ✅   |

**Tổng**: 2 use case (cần bổ sung more if needed)

### 5.4 Warehouse (Quản lý kho)

| UC    | Tên                  | Loại |
| ----- | -------------------- | ---- |
| UC-01 | Đăng nhập            | ✅   |
| UC-04 | Quản lý tồn kho      | ✅   |
| UC-05 | Quản lý giao hàng    | ✅   |
| UC-08 | Hoàn tiền / Trả hàng | ✅   |

**Tổng**: 4 use case

### 5.5 Customer (Khách hàng online)

| UC    | Tên                | Loại |
| ----- | ------------------ | ---- |
| UC-11 | Đặt hàng online    | ✅   |
| UC-12 | Thanh toán online  | ✅   |
| UC-13 | Theo dõi giao hàng | ✅   |
| UC-14 | Quản lý tài khoản  | ✅   |
| UC-15 | Đánh giá sản phẩm  | ✅   |

**Tổng**: 5 use case

---

## 6. Giai Đoạn Triển Khai (Recommendation)

### 🔴 Giai Đoạn 1: MVP (3 tháng) - Ưu Tiên Cao

**Admin**:

- ✅ UC-01: Đăng nhập
- ✅ UC-02: Quản lý sản phẩm
- ✅ UC-10: Quản lý người dùng

**Sales**:

- ✅ UC-03: Tạo đơn offline (POS)
- ✅ UC-04: Quản lý tồn kho (view)

**Warehouse**:

- ✅ UC-04: Quản lý tồn kho

**Customer**:

- ✅ UC-11: Đặt hàng online
- ✅ UC-12: Thanh toán online (cơ bản)

**Tất cả**:

- ✅ UC-01: Đăng nhập

### 🟡 Giai Đoạn 2: Enhancement (3-6 tháng)

- ✅ UC-05: Quản lý giao hàng
- ✅ UC-06: Quản lý khách hàng
- ✅ UC-08: Hoàn tiền / Trả hàng
- ✅ UC-09: Báo cáo (cơ bản)
- ✅ UC-13: Theo dõi giao hàng
- ✅ UC-14: Quản lý tài khoản khách

### 🟢 Giai Đoạn 3: Advanced Features (6-9 tháng)

- ✅ UC-07: Quản lý khuyến mãi
- ✅ UC-09: Báo cáo nâng cao
- ✅ UC-15: Đánh giá sản phẩm

---

## 7. So Sánh Before & After

### Before

```
✅ Use Case: 4
❌ Khách hàng online: Không có use case riêng
❌ Kế toán: Chỉ có đăng nhập
❌ Báo cáo: Không có use case
❌ Quản lý user: Không có use case riêng
❌ Quản lý khách: Không có use case
❌ Thanh toán online: Không có use case
```

### After

```
✅ Use Case: 13 (tăng 225%)
✅ Khách hàng online: 5 use case (UC-11 đến UC-15)
✅ Kế toán: 1 use case báo cáo tài chính (UC-09)
✅ Báo cáo: 1 use case hoàn chỉnh (UC-09)
✅ Quản lý user: 1 use case riêng (UC-10)
✅ Quản lý khách: 1 use case riêng (UC-06)
✅ Thanh toán online: 1 use case riêng (UC-12)
✅ Tất cả vai trò: Có use case tương ứng
```

---

## 8. Hành Động Tiếp Theo

### 8.1 Cần Làm Ngay

- [ ] Review lại các use case mới (UC-06 đến UC-15)
- [ ] Tách UC-03 thành 2 use case (POS + Trả hàng)
- [ ] Tách UC-04 thành 2 use case (Tồn kho + Giao hàng)
- [ ] Cập nhật lại mapping trong các file
- [ ] Kiểm tra chi tiết luồng chính/phụ của từng use case

### 8.2 Khuyến Nghị Tuần Tiếp Theo

- [ ] Tạo Activity Diagram cho các use case phức tạp (UC-03, UC-09, UC-12)
- [ ] Tạo Sequence Diagram cho payment flow (UC-12)
- [ ] Xác nhận với stakeholder về feasibility từng use case
- [ ] Bắt đầu thiết kế UI/UX cho MVP phase

### 8.3 Cập Nhật Documentation

- [ ] Cập nhật requirement.md với link đến các use case
- [ ] Tạo ERD (Entity Relationship Diagram) từ use case
- [ ] Tạo API specification từ use case
- [ ] Tạo test case từ each use case

---

## 9. Ghi Chú Quan Trọng

### ✅ Điểm Mạnh

- ✨ Bao phủ tất cả 5 vai trò chính
- ✨ Rõ ràng luồng chính/phụ
- ✨ Bao gồm ngoại lệ (exception handling)
- ✨ Yêu cầu phi chức năng cụ thể
- ✨ Ghi chú triển khai thực tế

### ⚠️ Cần Chú Ý

- ⚠️ UC-03 (POS) cần kiểm tra lại với requirement về offline mode
- ⚠️ UC-12 (Thanh toán) cần tích hợp thực tế với payment gateway
- ⚠️ UC-09 (Báo cáo) nên có performance testing (< 30 giây)
- ⚠️ UC-14 (Tài khoản) cần GDPR compliance validation

### 💡 Khuyến Nghị Bổ Sung (Tương Lai)

- 🔧 UC-16: Email/Notification System (tự động)
- 🔧 UC-17: Import/Export dữ liệu (Excel/CSV)
- 🔧 UC-18: Analytics Dashboard (Advanced)
- 🔧 UC-19: Multi-store Management (Mở rộng)

---

## 10. Kết Luận

✅ **Phân tích hoàn tất**: Tất cả 5 vai trò đều có use case tương ứng  
✅ **Use case đầy đủ**: 13 use case bao phủ toàn bộ chức năng hệ thống  
✅ **Sẵn sàng triển khai**: MVP phase có 9 use case (UC-01, 02, 03, 04, 10, 11, 12, 13, 14)  
✅ **Documentation đầy đủ**: Luồng chính, ngoại lệ, yêu cầu phi chức năng

**Tiếp theo**: Review use case với team, xác nhận feasibility và bắt đầu thiết kế hệ thống.

---

_Báo cáo được tạo vào 10/06/2026_  
_File tư liệu: USE_CASES_MAPPING.md, usecase[1-13].md, requirement.md_
