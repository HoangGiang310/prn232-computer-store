using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComputerStoreApi.Models
{

    // 5. KHUYẾN MÃI / VOUCHER
    public class Voucher
    {
        [Key]
        public string Code { get; set; } // Mã voucher (vd: LAPTOP2026)
        [Required]
        public string Name { get; set; }
        [Required]
        public string DiscountType { get; set; } // Percentage (%) hoặc FixedAmount (Số tiền cố định)
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal MinOrderValue { get; set; } // Giá trị đơn hàng tối thiểu áp dụng
        public int TotalUsageLimit { get; set; } // Giới hạn tổng số lần sử dụng
        public int UsedCount { get; set; } = 0;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

}
