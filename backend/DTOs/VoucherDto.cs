using System.ComponentModel.DataAnnotations;

namespace ComputerStoreApi.DTOs
{
    // DTO tạo voucher mới.
    public class CreateVoucherDto
    {
        [Required(ErrorMessage = "Mã voucher là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Mã voucher tối đa 50 ký tự.")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên chương trình là bắt buộc.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Loại giảm giá là bắt buộc.")]
        [RegularExpression("Percentage|FixedAmount", ErrorMessage = "Loại giảm giá phải là 'Percentage' hoặc 'FixedAmount'.")]
        public string DiscountType { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Giá trị giảm phải lớn hơn 0.")]
        public decimal DiscountValue { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá trị đơn tối thiểu không được âm.")]
        public decimal MinOrderValue { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Giới hạn sử dụng phải ít nhất là 1.")]
        public int TotalUsageLimit { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc.")]
        public DateTime EndDate { get; set; }
    }

    // DTO cập nhật voucher (không sửa Code vì là khóa chính).
    public class UpdateVoucherDto
    {
        [Required(ErrorMessage = "Tên chương trình là bắt buộc.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Loại giảm giá là bắt buộc.")]
        [RegularExpression("Percentage|FixedAmount", ErrorMessage = "Loại giảm giá phải là 'Percentage' hoặc 'FixedAmount'.")]
        public string DiscountType { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Giá trị giảm phải lớn hơn 0.")]
        public decimal DiscountValue { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá trị đơn tối thiểu không được âm.")]
        public decimal MinOrderValue { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Giới hạn sử dụng phải ít nhất là 1.")]
        public int TotalUsageLimit { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Số lần đã dùng không được âm.")]
        public int UsedCount { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc.")]
        public DateTime EndDate { get; set; }
    }
}
