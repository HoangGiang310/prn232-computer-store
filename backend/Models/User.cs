using System.ComponentModel.DataAnnotations;

namespace ComputerStoreApi.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "customer";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
