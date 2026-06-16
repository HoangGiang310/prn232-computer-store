using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
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

        // Tạo tài khoản nhân viên mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
            if (existing != null)
            {
                return BadRequest(new { message = "Tên tài khoản đã tồn tại." });
            }

            user.Id = Guid.NewGuid();
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            // Nếu mật khẩu trống, mặc định dùng "Staff@123"
            var passwordToHash = string.IsNullOrEmpty(user.PasswordHash) ? "Staff@123" : user.PasswordHash;
            user.PasswordHash = _passwordHasher.HashPassword(user, passwordToHash);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, new { user.Id, user.Username, user.FullName, user.Email, user.RoleName, user.IsActive });
        }

        // Cập nhật thông tin nhân viên
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] User userUpdate)
        {
            var existing = await _dbContext.Users.FindAsync(id);
            if (existing == null) return NotFound();

            existing.FullName = userUpdate.FullName;
            existing.Email = userUpdate.Email;
            existing.RoleName = userUpdate.RoleName;
            existing.IsActive = userUpdate.IsActive;

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
