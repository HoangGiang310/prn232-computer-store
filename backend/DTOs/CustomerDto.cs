using System.ComponentModel.DataAnnotations;

namespace ComputerStoreApi.DTOs
{
    // DTO cho tạo/cập nhật khách hàng (tránh lỗi validation do navigation Orders).
    public class CustomerDto
    {
        [Required(ErrorMessage = "Họ tên khách hàng là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc.")]
        [RegularExpression(@"^0\d{9,10}$", ErrorMessage = "Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số).")]
        public string PhoneNumber { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string? Email { get; set; }

        public string? Address { get; set; }

        public string? Notes { get; set; }

        public string? WebUsername { get; set; }
    }
}
