using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComputerStoreApi.Models
{
    // 8. ĐỔI TRẢ / HOÀN TIỀN
    public class OrderReturn
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }

        public string Reason { get; set; }
        public string Status { get; set; } // Requested, Processing, Refunded, Rejected
        [Column(TypeName = "decimal(18,2)")]
        public decimal RefundAmount { get; set; }

        public Guid? ProcessedById { get; set; } // Kế toán hoặc quản lý kho duyệt
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}