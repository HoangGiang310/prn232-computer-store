using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComputerStoreApi.Models
{
    // 3. SẢN PHẨM LAPTOP
    public class Product
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(50)]
        public string ProductCode { get; set; } // Mã sản phẩm (SKU)
        [Required, MaxLength(200)]
        public string Name { get; set; }
        [Required, MaxLength(100)]
        public string Brand { get; set; } // Hãng sản xuất
        [Required]
        public string Specifications { get; set; } // Cấu hình chi tiết (JSON hoặc Text)

        [Column(TypeName = "decimal(18,2)")]
        public decimal ImportPrice { get; set; } // Giá nhập
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Giá bán

        public int StockQuantity { get; set; } // Tồn kho hiện tại
        public int LowStockThreshold { get; set; } // Ngưỡng cảnh báo hết hàng

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<ProductImage> Images { get; set; }
    }
}
