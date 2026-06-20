using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.DTOs;
using ComputerStoreApi.Models;
using ComputerStoreApi.Services;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly IJwtService _jwtService;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public AuthController(AppDbContext dbContext, IJwtService jwtService)
        {
            _dbContext = dbContext;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == login.Username);
            if (user == null)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            // Kiểm tra xem tài khoản có đang hoạt động hay không
            if (!user.IsActive)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động." });
            }

            // Kiểm tra và xác thực mật khẩu đã mã hóa
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, login.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            // Đồng bộ GenerateToken theo RoleName của hệ thống mới
            var token = _jwtService.GenerateToken(user.Username, user.RoleName);
            return Ok(new { token, role = user.RoleName, username = user.Username, fullName = user.FullName });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Do JWT là Stateless Token xử lý ở Client (Xóa ở LocalStorage/Cookie), API chỉ cần trả về thông báo thành công
            return Ok(new { message = "Đã đăng xuất an toàn thành công." });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto register)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Kiểm tra trùng lặp tài khoản hoặc email trong hệ thống
            if (await _dbContext.Users.AnyAsync(u => u.Username == register.Username || u.Email == register.Email))
            {
                return BadRequest(new { message = "Tên tài khoản hoặc email đã tồn tại trên hệ thống." });
            }

            // Bảo mật: API đăng ký công khai CHỈ cho phép tạo tài khoản khách hàng (customer).
            // Các vai trò nội bộ (admin, sales, accountant, warehouse) phải do Admin tạo qua UC-10.
            var requestedRole = string.IsNullOrWhiteSpace(register.Role) ? "customer" : register.Role.Trim().ToLower();
            if (requestedRole != "customer")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Đăng ký công khai chỉ dành cho tài khoản khách hàng. Vui lòng liên hệ quản trị viên để tạo tài khoản nhân viên." });
            }

            // Tạo thực thể người dùng mới khớp 100% với cấu trúc bảng cơ sở dữ liệu
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = register.Username,
                FullName = string.IsNullOrEmpty(register.FullName) ? register.Username : register.FullName,
                Email = register.Email,
                RoleName = requestedRole, // Luôn là customer cho đăng ký công khai
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Mã hóa mật khẩu an toàn trước khi lưu vào Database
            user.PasswordHash = _passwordHasher.HashPassword(user, register.Password);

            _dbContext.Users.Add(user);

            if (user.RoleName.ToLower() == "customer")
            {
                var customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    FullName = user.FullName,
                    PhoneNumber = string.IsNullOrEmpty(register.PhoneNumber) ? "0000000000" : register.PhoneNumber,
                    Email = user.Email,
                    Address = register.Address,
                    Notes = "Khách hàng online tự tạo tài khoản.",
                    WebUsername = user.Username,
                    WebPasswordHash = user.PasswordHash,
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.Customers.Add(customer);
            }

            await _dbContext.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user.Username, user.RoleName);
            return CreatedAtAction(nameof(Login), new { username = user.Username }, new
            {
                token,
                role = user.RoleName,
                username = user.Username,
                fullName = user.FullName
            });
        }
    }
}
