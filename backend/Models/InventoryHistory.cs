using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComputerStoreApi.Models
{

    // 4. LỊCH SỬ KHO
    public class InventoryHistory
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProductId { get; set; }
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }
        [Required]
        public string ChangeType { get; set; } // Import (Nhập), Export_POS, Export_Online, Return (Trả), Adjustment (Sửa số lượng)
        public int QuantityChanged { get; set; } // Số lượng thay đổi (ví dụ: +10 hoặc -2)
        public int NewStock { get; set; } // Số tồn thực tế sau khi đổi
        public string Note { get; set; }
        public Guid? ChangedById { get; set; } // Nhân viên thực hiện thay đổi
        public DateTime ChangeDate { get; set; } = DateTime.UtcNow;
    }
}