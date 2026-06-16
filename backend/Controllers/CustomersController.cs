using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;

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
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // Thêm khách hàng mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer customer)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            customer.Id = Guid.NewGuid();
            customer.CreatedAt = DateTime.UtcNow;
            
            // Đảm bảo không lỗi do các trường WebUsername/WebPasswordHash null ở DB seeder
            if (string.IsNullOrEmpty(customer.WebUsername))
            {
                customer.WebUsername = "customer_" + customer.PhoneNumber;
            }
            if (string.IsNullOrEmpty(customer.WebPasswordHash))
            {
                customer.WebPasswordHash = "no_password_offline";
            }

            _dbContext.Customers.Add(customer);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }

        // Cập nhật thông tin khách hàng
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Customer customer)
        {
            var existing = await _dbContext.Customers.FindAsync(id);
            if (existing == null) return NotFound();

            existing.FullName = customer.FullName;
            existing.PhoneNumber = customer.PhoneNumber;
            existing.Email = customer.Email;
            existing.Address = customer.Address;
            existing.Notes = customer.Notes;

            if (!string.IsNullOrEmpty(customer.WebUsername))
            {
                existing.WebUsername = customer.WebUsername;
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
