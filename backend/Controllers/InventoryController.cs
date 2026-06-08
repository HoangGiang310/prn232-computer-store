using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public InventoryController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _dbContext.Products
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.Name,
                    p.Brand,
                    p.Price,
                    p.StockQuantity,
                    p.LowStockThreshold,
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var history = await _dbContext.InventoryHistories
                .Include(h => h.Product)
                .OrderByDescending(h => h.ChangeDate)
                .ToListAsync();

            return Ok(history);
        }

        [Authorize(Roles = "admin,sales,warehouse")]
        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustInventory([FromBody] InventoryAdjustmentRequest request)
        {
            if (request == null || request.ProductId == Guid.Empty)
            {
                return BadRequest("Dữ liệu điều chỉnh tồn kho không hợp lệ.");
            }

            var product = await _dbContext.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound("Không tìm thấy sản phẩm.");
            }

            var newStock = product.StockQuantity + request.QuantityChanged;
            if (newStock < 0)
            {
                return BadRequest("Số lượng tồn kho không thể âm.");
            }

            product.StockQuantity = newStock;

            var history = new InventoryHistory
            {
                ProductId = product.Id,
                ChangeType = request.ChangeType,
                QuantityChanged = request.QuantityChanged,
                NewStock = newStock,
                Note = request.Note,
                ChangedById = request.ChangedById,
                ChangeDate = DateTime.UtcNow,
            };

            _dbContext.InventoryHistories.Add(history);
            await _dbContext.SaveChangesAsync();
            return Ok(history);
        }
    }

    public class InventoryAdjustmentRequest
    {
        public Guid ProductId { get; set; }
        public int QuantityChanged { get; set; }
        public string ChangeType { get; set; }
        public string Note { get; set; }
        public Guid? ChangedById { get; set; }
    }
}
