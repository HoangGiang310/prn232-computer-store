using System.ComponentModel.DataAnnotations;

namespace ComputerStoreApi.DTOs
{
    // DTO cho tạo/cập nhật sản phẩm — chỉ chứa các trường client gửi lên,
    // tránh lỗi validation do navigation property (Images) của Entity.
    public class ProductDto
    {
        [Required(ErrorMessage = "Mã sản phẩm là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Mã sản phẩm tối đa 50 ký tự.")]
        public string ProductCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc.")]
        [StringLength(200, ErrorMessage = "Tên sản phẩm tối đa 200 ký tự.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Hãng sản xuất là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Tên hãng tối đa 100 ký tự.")]
        public string Brand { get; set; } = string.Empty;

        [Required(ErrorMessage = "Cấu hình sản phẩm là bắt buộc.")]
        public string Specifications { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Giá nhập không được âm.")]
        public decimal ImportPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá bán không được âm.")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho không được âm.")]
        public int StockQuantity { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Ngưỡng cảnh báo tồn kho không được âm.")]
        public int LowStockThreshold { get; set; }
    }
}
