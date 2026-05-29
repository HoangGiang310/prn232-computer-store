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

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, login.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            var token = _jwtService.GenerateToken(user.Username, user.Role);
            return Ok(new { token, role = user.Role, username = user.Username });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Đã đăng xuất thành công." });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto register)
        {
            if (await _dbContext.Users.AnyAsync(u => u.Username == register.Username || u.Email == register.Email))
            {
                return BadRequest(new { message = "Tên tài khoản hoặc email đã tồn tại." });
            }

            var user = new User
            {
                Username = register.Username,
                Email = register.Email,
                Role = register.Role
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, register.Password);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(Login), new { username = user.Username }, new { user.Id, user.Username, user.Email, user.Role });
        }
    }
}
