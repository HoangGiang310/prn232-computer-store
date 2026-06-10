# Use Case 9: Đặt hàng online (Khách hàng)

## Mã Use Case

UC-11

## Tên

Đặt hàng online

## Diễn giải

Khách hàng duyệt sản phẩm trên website, thêm vào giỏ hàng, chọn địa chỉ giao nhận và phương thức vận chuyển, sau đó xác nhận đặt hàng.

## Diễn viên chính

- Khách hàng (Customer)

## Các diễn viên phụ

- Hệ thống e-commerce
- Hệ thống quản lý sản phẩm
- Hệ thống tồn kho
- Hệ thống thanh toán
- Hệ thống giao hàng

## Điều kiện tiên quyết

- Khách hàng truy cập được website.
- Khách hàng đã đăng nhập hoặc có thể mua hàng mà không cần đăng nhập (guest checkout).
- Sản phẩm có sẵn trong kho.

## Điều kiện hậu yêu cầu

- Đơn hàng được tạo thành công và lưu vào hệ thống.
- Khách hàng nhận được email xác nhận đơn.
- Tồn kho được cập nhật sau khi thanh toán hoàn tất.

## Luồng chính

1. Khách hàng truy cập website bán hàng.
2. Khách hàng duyệt danh sách sản phẩm hoặc tìm kiếm sản phẩm cần.
3. Khách hàng chọn sản phẩm để xem chi tiết (tên, giá, hình ảnh, thông số, tồn kho).
4. Khách hàng nhấn `Thêm vào giỏ` và chọn số lượng.
5. Hệ thống kiểm tra tồn kho:
   - Nếu đủ hàng, thêm sản phẩm vào giỏ hàng và hiển thị thông báo thành công.
   - Nếu hết hàng, hiển thị thông báo "Sản phẩm hiện không có sẵn".
6. Khách hàng tiếp tục duyệt hoặc chọn `Xem giỏ hàng`.
7. Hệ thống hiển thị giỏ hàng:
   - Danh sách sản phẩm đã chọn
   - Số lượng, giá từng sản phẩm
   - Tổng tiền tạm (trước voucher)
8. Khách hàng có thể:
   - Chỉnh sửa số lượng từng sản phẩm
   - Xóa sản phẩm khỏi giỏ
   - Tiếp tục mua hàng
9. Khách hàng nhấn `Tiến hành thanh toán` hoặc `Đặt hàng`.
10. Hệ thống yêu cầu khách hàng nhập thông tin giao hàng:
    - Tên người nhận
    - Số điện thoại
    - Email
    - Địa chỉ giao hàng
    - Ghi chú thêm (tùy chọn)
11. Khách hàng chọn phương thức vận chuyển (nếu có):
    - Giao hàng nhanh (1-2 ngày)
    - Giao hàng tiêu chuẩn (3-5 ngày)
    - Lấy tại cửa hàng (nếu có chính sách)
12. Hệ thống tính toán phí vận chuyển và hiển thị.
13. Khách hàng có thể nhập mã voucher để giảm giá.
14. Hệ thống hiển thị:
    - Tổng tiền hàng
    - Phí vận chuyển
    - Giảm giá (nếu có)
    - Tổng thanh toán
15. Khách hàng nhấn `Xác nhận đặt hàng`.
16. Hệ thống chuyển sang trang thanh toán.

## Luồng phụ / ngoại lệ

- Nếu khách hàng không đăng nhập, hệ thống cho phép checkout as guest (nhập email để xác nhận).
- Nếu số lượng chọn lớn hơn tồn kho, hệ thống hiển thị số lượng tối đa có sẵn.
- Nếu khách muốn thêm sản phẩm khác, quay lại bước 2-5.
- Nếu khách muốn hủy đơn, có thể xóa toàn bộ giỏ và quay về trang chính.
- Nếu địa chỉ không hợp lệ, hệ thống thông báo và yêu cầu sửa.
- Nếu mã voucher không hợp lệ hoặc hết hạn, hệ thống thông báo.
- Khách hàng có thể lưu địa chỉ để sử dụng lần sau.

## Yêu cầu phi chức năng liên quan

- Giỏ hàng phải tải nhanh, dữ liệu được lưu trên client (localStorage) hoặc server.
- Thêm sản phẩm vào giỏ phải tức thì (< 500ms).
- Kiểm tra tồn kho phải real-time.
- Giao diện giỏ hàng phải responsive, dùng tốt trên mobile.
- Bảo mật thông tin khách hàng (HTTPS, encrypt dữ liệu thanh toán).

## Ghi chú

- Khách hàng có thể lưu giỏ hàng tạm thời để xem lại sau (nếu có tài khoản).
- Hệ thống nên gợi ý sản phẩm liên quan hoặc bán chạy khác.
- Hiển thị review/đánh giá sản phẩm từ khách khác để tăng độ tin cậy.
- Hỗ trợ "Wish list" - lưu sản phẩm để mua lần sau.
