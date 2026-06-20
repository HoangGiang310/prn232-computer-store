using System.ComponentModel.DataAnnotations;

namespace ComputerStoreApi.DTOs
{
    // DTO tạo tài khoản nhân viên — nhận password thô (sẽ được hash ở controller),
    // tránh lỗi validation do trường PasswordHash [Required] của Entity User.
    public class CreateUserDto
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên đăng nhập phải từ 3 đến 50 ký tự.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Vai trò là bắt buộc.")]
        public string RoleName { get; set; } = string.Empty;

        // Mật khẩu tùy chọn: nếu để trống sẽ dùng mặc định "Staff@123"
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.")]
        public string? Password { get; set; }

        public bool IsActive { get; set; } = true;
    }

    // DTO cập nhật nhân viên (không đổi mật khẩu ở đây).
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Vai trò là bắt buộc.")]
        public string RoleName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
