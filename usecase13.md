# Use Case 13: Đánh giá và Bình luận Sản phẩm

## Mã Use Case

UC-15

## Tên

Đánh giá và Bình luận Sản phẩm

## Diễn giải

Khách hàng có thể đánh giá sao (1-5) và viết bình luận cho sản phẩm sau khi mua, hiển thị đánh giá công khai để khách hàng khác tham khảo.

## Diễn viên chính

- Khách hàng (Customer - đã mua sản phẩm)

## Các diễn viên phụ

- Admin (xóa/ẩn bình luận không phù hợp)
- Hệ thống quản lý đánh giá
- Cơ sở dữ liệu bình luận
- Hệ thống thông báo

## Điều kiện tiên quyết

- Khách hàng đã mua sản phẩm (có trong lịch sử đơn hàng).
- Khách hàng đã đăng nhập vào tài khoản.
- Đơn hàng đã được giao thành công (hoặc có thể đánh giá từ khi thanh toán).

## Điều kiện hậu yêu cầu

- Đánh giá được lưu trữ trong hệ thống.
- Trung bình đánh giá được cập nhật trên trang sản phẩm.
- Bình luận hiển thị công khai sau khi được duyệt (nếu cần).

## Luồng chính

1. Khách hàng truy cập trang chi tiết sản phẩm.
2. Hệ thống kiểm tra xem khách đã mua sản phẩm này hay chưa.
3. Nếu đã mua, hệ thống hiển thị mục `Đánh giá sản phẩm của bạn` hoặc nút `Viết đánh giá`.
4. Khách hàng chọn `Viết đánh giá`.
5. Hệ thống mở form đánh giá:
   - **Chọn số sao** (1-5):
     - 1 sao: Không hài lòng
     - 2 sao: Khá hài lòng
     - 3 sao: Bình thường
     - 4 sao: Hài lòng
     - 5 sao: Rất hài lòng
   - **Tiêu đề bình luận** (tùy chọn): "Laptop tốt, giá cả phải chăng", v.v.
   - **Nội dung bình luận**: Viết chi tiết nhận xét, trải nghiệm
   - Có thể upload ảnh (tùy chọn)
   - Điều khoản: Đồng ý chia sẻ đánh giá công khai

6. Khách hàng nhấn `Gửi đánh giá`.
7. Hệ thống xác thực dữ liệu (nội dung không spam, không chứa từ khóa xấu).
8. Hệ thống lưu đánh giá.
9. Hiển thị thông báo: `Đánh giá của bạn đã được gửi thành công!`
   - Nếu cần duyệt: "Đánh giá của bạn sẽ xuất hiện sau khi được kiểm duyệt"
   - Nếu không cần duyệt: "Đánh giá đã được công bố"

## Luồng Hiển Thị Đánh Giá

1. Hệ thống tôn hiển thị trên trang sản phẩm:
   - **Trung bình đánh giá**: "4.5 / 5 sao" (ở trang chủ hoặc tìm kiếm)
   - **Biểu đồ đánh giá**:
     - 5 sao: 60% (120 đánh giá)
     - 4 sao: 25% (50 đánh giá)
     - 3 sao: 10% (20 đánh giá)
     - 2 sao: 3% (6 đánh giá)
     - 1 sao: 2% (4 đánh giá)
   - **Danh sách bình luận**:
     - Tên khách hàng
     - Số sao đánh giá
     - Ngày đánh giá
     - Tiêu đề và nội dung bình luận
     - Ảnh (nếu có)
     - Số lượt "Hữu ích" (like/upvote)

2. Sắp xếp bình luận theo:
   - Hữu ích nhất (mặc định)
   - Mới nhất
   - Đánh giá cao nhất
   - Đánh giá thấp nhất

3. Lọc bình luận:
   - Tất cả đánh giá
   - 5 sao
   - 4 sao
   - 3 sao
   - 2 sao
   - 1 sao
   - Có ảnh

4. Khách hàng khác có thể:
   - Nhấn `Hữu ích` (upvote) nếu bình luận hữu ích
   - Nhấn `Không hữu ích` (downvote) nếu bình luận không hữu ích
   - Nhấn `Báo cáo` nếu bình luận vi phạm quy tắc

## Luồng phụ / ngoại lệ

- **Khách hàng muốn sửa đánh giá của mình**:
  1. Chọn bình luận của mình
  2. Nhấn nút `Sửa`
  3. Cập nhật nội dung, số sao
  4. Nhấn `Lưu thay đổi`
  5. Hệ thống cập nhật

- **Khách hàng muốn xóa đánh giá của mình**:
  1. Chọn bình luận của mình
  2. Nhấn nút `Xóa`
  3. Hệ thống yêu cầu xác nhận
  4. Khách xác nhận và bình luận được xóa

- **Bình luận bị báo cáo**:
  1. Nếu nhân viên/admin nhận được báo cáo, kiểm tra nội dung
  2. Nếu vi phạm, xóa hoặc ẩn bình luận
  3. Nếu không vi phạm, giữ nguyên

- **Admin kiểm duyệt bình luận** (nếu có chính sách):
  1. Admin vào trang quản lý bình luận
  2. Xem danh sách bình luận chờ duyệt
  3. Duyệt (hiển thị) hoặc từ chối (xóa)
  4. Ghi chú lý do từ chối (hiển thị cho khách)

- **Bình luận chứa từ khóa spam**:
  1. Hệ thống phát hiện
  2. Tự động ẩn bình luận hoặc gửi cho admin kiểm duyệt
  3. Thông báo cho khách: "Bình luận của bạn chứa nội dung không phù hợp"

## Yêu cầu phi chức năng liên quan

- Hiển thị đánh giá phải tức thì (< 500ms sau khi gửi).
- Trung bình đánh giá phải được cache và cập nhật hàng giờ.
- Giao diện phải responsive trên mobile.
- Ghi log tất cả bình luận để audit.
- Hỗ trợ moderation API để kiểm tra spam tự động.

## Ghi chú

- Hệ thống nên xác thực khách hàng thực sự mua sản phẩm (không cho phép đánh giá nếu chưa mua).
- Khách có thể đánh giá nhiều lần nếu mua nhiều lần, nhưng chỉ hiển thị đánh giá mới nhất (hoặc tất cả).
- Hỗ trợ verified purchase badge (✓ Đã xác thực mua hàng) để tăng độ tin cậy.
- Admin có thể ẩn bình luận không phù hợp mà không cần xóa (soft delete).
- Có thể tích hợp AI anti-spam để lọc bình luận rác tự động.
- Hệ thống nên cảnh báo khách nếu bình luận chứa các từ không phù hợp/xúc phạm.
