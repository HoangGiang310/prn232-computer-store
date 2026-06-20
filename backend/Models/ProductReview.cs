using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ComputerStoreApi.Models
{
    // 9. ĐÁNH GIÁ & BÌNH LUẬN SẢN PHẨM (UC-15)
    public class ProductReview
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProductId { get; set; }
        [ForeignKey("ProductId")]
        [JsonIgnore]
        public virtual Product Product { get; set; }

        // Khách hàng đã mua sản phẩm và để lại đánh giá
        public Guid CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        [JsonIgnore]
        public virtual Customer Customer { get; set; }

        // Lưu bản sao tên khách để hiển thị nhanh, tránh phải join mỗi lần đọc
        public string CustomerName { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; } // Số sao từ 1 đến 5

        [MaxLength(150)]
        public string Title { get; set; } // Tiêu đề bình luận (tùy chọn)

        public string Content { get; set; } // Nội dung bình luận

        // Xác nhận khách thật sự đã mua sản phẩm (verified purchase badge)
        public bool IsVerifiedPurchase { get; set; } = false;

        // Admin có thể ẩn bình luận không phù hợp mà không cần xóa (soft hide)
        public bool IsHidden { get; set; } = false;

        public int HelpfulCount { get; set; } = 0; // Số lượt "Hữu ích"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
