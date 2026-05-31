using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComputerStoreApi.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(50)]
        public string Username { get; set; }
        [Required]
        public string PasswordHash { get; set; } // Mật khẩu đã mã hóa
        [Required, MaxLength(100)]
        public string FullName { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string RoleName { get; set; }
        [ForeignKey("RoleName")]
        public virtual Role Role { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
