using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComputerStoreApi.Models
{

    // 7. VẬN CHUYỂN
    public class Shipment
    {
        [Key]
        public Guid OrderId { get; set; }
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }

        public string Carrier { get; set; } // Đơn vị vận chuyển (GHTK, ViettelPost...)
        public string TrackingNumber { get; set; } // Số vận đơn
        public string ShipmentStatus { get; set; } // Pending, Shipping, Delivered, Failed
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }
}