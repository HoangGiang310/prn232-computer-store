using System.ComponentModel.DataAnnotations;

namespace ComputerStoreApi.Models
{
    public class Order
    {
        [Key]
        public Guid Id { get; set; }

        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "new";
        public string Channel { get; set; } = "online";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
