using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin,warehouse,sales")]
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

            var userIds = history
                .Where(h => h.ChangedById.HasValue)
                .Select(h => h.ChangedById!.Value)
                .Distinct()
                .ToList();

            var userNames = await _dbContext.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Username);

            var result = history.Select(h => new
            {
                h.Id,
                h.ProductId,
                Product = h.Product == null ? null : new { h.Product.Name, h.Product.ProductCode },
                h.ChangeType,
                h.QuantityChanged,
                h.NewStock,
                h.Note,
                h.ChangedById,
                ChangedByUsername = h.ChangedById.HasValue && userNames.TryGetValue(h.ChangedById.Value, out var username)
                    ? username
                    : null,
                h.ChangeDate
            });

            return Ok(result);
        }

        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustInventory([FromBody] InventoryAdjustmentRequest request)
        {
            if (request == null || request.ProductId == Guid.Empty)
            {
                return BadRequest("Dữ liệu điều chỉnh tồn kho không hợp lệ.");
            }

            if (request.QuantityChanged == 0)
            {
                return BadRequest("Số lượng thay đổi phải khác 0.");
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

            if (string.IsNullOrWhiteSpace(request.ChangeType))
            {
                request.ChangeType = "Adjustment";
            }

            if (string.IsNullOrWhiteSpace(request.Note))
            {
                request.Note = "Điều chỉnh kho thủ công";
            }

            if (!request.ChangedById.HasValue)
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (!string.IsNullOrWhiteSpace(username))
                {
                    var currentUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == username);
                    if (currentUser != null)
                    {
                        request.ChangedById = currentUser.Id;
                    }
                }
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
