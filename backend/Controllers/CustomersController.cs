using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.DTOs;
using ComputerStoreApi.Models;
using System.Security.Claims;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public CustomersController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Lấy danh sách khách hàng (có phân trang và tìm kiếm)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _dbContext.Customers.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var term = search.ToLower();
                query = query.Where(c => c.FullName.ToLower().Contains(term) || 
                                         c.PhoneNumber.Contains(term) || 
                                         (c.Email != null && c.Email.ToLower().Contains(term)));
            }

            var customers = await query
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(customers);
        }

        // Xem chi tiết khách hàng
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var customer = await _dbContext.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        [Authorize(Roles = "customer")]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentCustomer()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.WebUsername == username);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        [Authorize(Roles = "customer")]
        [HttpGet("me/orders")]
        public async Task<IActionResult> GetCurrentCustomerOrders()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.WebUsername == username);
            if (customer == null) return NotFound();

            var orders = await _dbContext.Orders
                .Where(o => o.CustomerId == customer.Id)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // Xem lịch sử mua hàng của khách
        [HttpGet("{id}/orders")]
        public async Task<IActionResult> GetOrders(Guid id)
        {
            var customer = await _dbContext.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            var orders = await _dbContext.Orders
                .Where(o => o.CustomerId == id)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // Thêm khách hàng mới (dùng DTO + validation)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName.Trim(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                Email = dto.Email ?? string.Empty,
                Address = dto.Address ?? string.Empty,
                Notes = dto.Notes ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            // Đảm bảo không lỗi do các trường WebUsername/WebPasswordHash NOT NULL
            customer.WebUsername = string.IsNullOrEmpty(dto.WebUsername)
                ? "customer_" + dto.PhoneNumber
                : dto.WebUsername;
            customer.WebPasswordHash = "no_password_offline";

            _dbContext.Customers.Add(customer);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }

        // Cập nhật thông tin khách hàng (dùng DTO + validation)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CustomerDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _dbContext.Customers.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Không tìm thấy khách hàng." });

            existing.FullName = dto.FullName.Trim();
            existing.PhoneNumber = dto.PhoneNumber.Trim();
            existing.Email = dto.Email ?? existing.Email;
            existing.Address = dto.Address ?? existing.Address;
            existing.Notes = dto.Notes ?? existing.Notes;

            if (!string.IsNullOrEmpty(dto.WebUsername))
            {
                existing.WebUsername = dto.WebUsername;
            }

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        // Xóa khách hàng (soft-delete bằng cách gỡ liên kết khỏi đơn hàng rồi xóa thực thể)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var customer = await _dbContext.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            // Gỡ liên kết với đơn hàng để giữ lại lịch sử đơn hàng
            var orders = await _dbContext.Orders.Where(o => o.CustomerId == id).ToListAsync();
            foreach (var order in orders)
            {
                order.CustomerId = null;
            }

            _dbContext.Customers.Remove(customer);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
