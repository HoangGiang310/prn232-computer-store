using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public OrdersController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [Authorize(Roles = "admin,staff,customer")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _dbContext.Orders.ToListAsync();
            return Ok(orders);
        }

        [Authorize(Roles = "admin,staff,customer")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            order.CreatedAt = DateTime.UtcNow;
            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        [Authorize(Roles = "admin,staff")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] Order order)
        {
            var existing = await _dbContext.Orders.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Status = order.Status;
            existing.Channel = order.Channel;
            existing.TotalAmount = order.TotalAmount;
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "admin,staff,customer")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _dbContext.Orders.FindAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }
    }
}
