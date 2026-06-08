using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ComputerStoreApi.Models
{
    public class ProductImage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProductId { get; set; }
        [ForeignKey("ProductId")]
        [JsonIgnore]
        public virtual Product Product { get; set; }
        [Required]
        public string ImageUrl { get; set; }
        public bool IsMain { get; set; } = false; // Ảnh đại diện chính
    }
}