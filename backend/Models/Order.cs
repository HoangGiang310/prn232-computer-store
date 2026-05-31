using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComputerStoreApi.Models
{
    // 6. ĐƠN HÀNG & CHI TIẾT
    public class Order
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string OrderChannel { get; set; } // Online / Offline
        [Required]
        public string OrderStatus { get; set; } // New, Confirmed, Shipping, Delivered, Cancelled, Returned
        [Required]
        public string PaymentMethod { get; set; } // Cash, Card, E-Wallet
        public bool IsPaid { get; set; } = false;

        public Guid? CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public virtual Customer Customer { get; set; }

        // Lưu bản sao thông tin giao hàng tránh TH khách hàng đổi địa chỉ sau này
        public string ShippingName { get; set; }
        public string ShippingPhone { get; set; }
        public string ShippingAddress { get; set; }

        public string? VoucherCode { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } // Tổng tiền hàng chưa giảm
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } // Số tiền được giảm
        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal FinalAmount { get; set; } // Tổng tiền phải trả cuối cùng

        public Guid? CreatedById { get; set; } // Nhân viên tạo đơn (nếu có)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<OrderItem> OrderItems { get; set; }
        public virtual Shipment Shipment { get; set; }
    }
}
