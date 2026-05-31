using System.ComponentModel.DataAnnotations;

namespace ComputerStoreApi.Models
{

    // 2. KHÁCH HÀNG

    public class Customer
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(100)]
        public string FullName { get; set; }
        [Required, MaxLength(15)]
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Notes { get; set; }

        // Dành cho khách hàng có tài khoản Online đăng nhập bằng App/Web
        public string WebUsername { get; set; }
        public string WebPasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<Order> Orders { get; set; }
    }
}