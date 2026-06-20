using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.DTOs;
using ComputerStoreApi.Models;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public UsersController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Lấy danh sách nhân viên
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _dbContext.Users
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
            return Ok(users);
        }

        // Chi tiết nhân viên
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        // Các vai trò hợp lệ trong hệ thống
        private static readonly string[] ValidRoles = { "admin", "sales", "accountant", "warehouse", "customer" };

        // Tạo tài khoản nhân viên mới (dùng DTO + validation)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var role = dto.RoleName.Trim().ToLower();
            if (!ValidRoles.Contains(role))
            {
                return BadRequest(new { message = "Vai trò không hợp lệ. Chọn: admin, sales, accountant, warehouse." });
            }

            var usernameTaken = await _dbContext.Users.AnyAsync(u => u.Username == dto.Username);
            if (usernameTaken)
            {
                return BadRequest(new { message = "Tên tài khoản đã tồn tại." });
            }

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var emailTaken = await _dbContext.Users.AnyAsync(u => u.Email == dto.Email);
                if (emailTaken)
                {
                    return BadRequest(new { message = "Email đã được sử dụng." });
                }
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username.Trim(),
                FullName = dto.FullName.Trim(),
                Email = dto.Email ?? string.Empty,
                RoleName = role,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                PasswordHash = string.Empty
            };

            // Nếu mật khẩu trống, mặc định dùng "Staff@123"
            var passwordToHash = string.IsNullOrEmpty(dto.Password) ? "Staff@123" : dto.Password;
            user.PasswordHash = _passwordHasher.HashPassword(user, passwordToHash);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, new { user.Id, user.Username, user.FullName, user.Email, user.RoleName, user.IsActive });
        }

        // Cập nhật thông tin nhân viên (dùng DTO + validation)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _dbContext.Users.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Không tìm thấy nhân viên." });

            var role = dto.RoleName.Trim().ToLower();
            if (!ValidRoles.Contains(role))
            {
                return BadRequest(new { message = "Vai trò không hợp lệ." });
            }

            // Kiểm tra email trùng với người khác
            if (!string.IsNullOrEmpty(dto.Email))
            {
                var emailTaken = await _dbContext.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);
                if (emailTaken)
                {
                    return BadRequest(new { message = "Email đã được sử dụng bởi tài khoản khác." });
                }
            }

            existing.FullName = dto.FullName.Trim();
            existing.Email = dto.Email ?? existing.Email;
            existing.RoleName = role;
            existing.IsActive = dto.IsActive;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        // Reset mật khẩu nhân viên về mặc định "Staff@123"
        [HttpPut("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
        {
            var existing = await _dbContext.Users.FindAsync(id);
            if (existing == null) return NotFound();

            var newPassword = string.IsNullOrEmpty(request.NewPassword) ? "Staff@123" : request.NewPassword;
            existing.PasswordHash = _passwordHasher.HashPassword(existing, newPassword);

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = $"Đã đặt lại mật khẩu về '{newPassword}' thành công." });
        }

        // Xóa hoặc vô hiệu hóa nhân viên
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return NotFound();

            // Thực hiện soft-delete (Vô hiệu hóa tài khoản) để lưu lại dấu vết Audit Log
            user.IsActive = false;
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        public class ResetPasswordRequest
        {
            public string NewPassword { get; set; }
        }
    }
}
