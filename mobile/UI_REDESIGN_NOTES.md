# TQG Store Mobile - UI/Layout Refinement

Bản này tập trung nâng cấp bố cục và hệ thống thị giác, giữ nguyên luồng nghiệp vụ/API hiện có.

## Các phần đã chỉnh

- Xây lại design system trong `lib/theme/app_theme.dart`:
  - nền trung tính sáng hơn;
  - màu than đậm làm nền điều hướng;
  - cam thương hiệu dùng làm accent/CTA;
  - đồng bộ radius, input, button, chip, checkbox, typography.
- Thêm bộ UI dùng chung tại `lib/widgets/store_ui.dart`:
  - section header;
  - product card;
  - empty state;
  - tag/stock state.
- Thiết kế lại `HomeScreen`:
  - hero premium tech;
  - search rõ ràng;
  - category shortcut;
  - quick actions;
  - promo card;
  - danh sách sản phẩm mới có hierarchy tốt hơn.
- Thiết kế lại `ProductsScreen`:
  - khu vực discovery/search/filter sạch hơn;
  - chip danh mục;
  - product card đồng bộ.
- Thiết kế lại `CartScreen`:
  - danh sách sản phẩm dễ quét hơn;
  - checkbox/quantity/delete gọn;
  - checkout summary cố định và rõ CTA.
- Thiết kế lại `LoginScreen` và `RegisterScreen`:
  - header dark premium;
  - form card rõ hierarchy;
  - input/button đồng bộ design system.
- Đồng bộ palette cho các screen còn lại để tránh cảm giác mỗi màn một phong cách.

## Ghi chú

Môi trường xử lý không có Flutter SDK nên chưa chạy được `flutter analyze` / emulator tại đây. Cấu trúc Dart của các file được chỉnh chính đã được kiểm tra delimiter và tham chiếu design token.
