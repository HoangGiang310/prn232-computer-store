using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReturnsController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public ReturnsController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Lấy danh sách phiếu trả hàng
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var returns = await _dbContext.OrderReturns
                .Include(r => r.Order)
                .ThenInclude(o => o.Customer)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
            return Ok(returns);
        }

        // Tạo yêu cầu trả hàng
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReturnRequest request)
        {
            if (request == null || request.OrderId == Guid.Empty)
            {
                return BadRequest("Thông tin đơn hàng trả lại không hợp lệ.");
            }

            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId);

            if (order == null)
            {
                return NotFound("Không tìm thấy đơn hàng cần trả.");
            }

            if (order.OrderStatus == "Returned")
            {
                return BadRequest("Đơn hàng này đã được hoàn trả trước đó.");
            }

            var existingReturn = await _dbContext.OrderReturns
                .FirstOrDefaultAsync(r => r.OrderId == request.OrderId && r.Status != "Rejected");
            if (existingReturn != null)
            {
                return BadRequest("Đã có một yêu cầu trả hàng đang được xử lý cho đơn hàng này.");
            }

            var orderReturn = new OrderReturn
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                Reason = request.Reason,
                Status = "Requested",
                RefundAmount = order.FinalAmount, // Hoàn lại toàn bộ số tiền thanh toán của đơn hàng
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.OrderReturns.Add(orderReturn);
            await _dbContext.SaveChangesAsync();

            return Ok(orderReturn);
        }

        // Xử lý duyệt hoặc từ chối trả hàng
        [HttpPut("{id}/process")]
        public async Task<IActionResult> Process(Guid id, [FromBody] ProcessReturnRequest request)
        {
            var orderReturn = await _dbContext.OrderReturns
                .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (orderReturn == null) return NotFound();

            if (orderReturn.Status == "Refunded" || orderReturn.Status == "Rejected")
            {
                return BadRequest("Phiếu trả hàng này đã được xử lý xong.");
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                orderReturn.Status = request.Status; // Refunded hoặc Rejected
                orderReturn.ProcessedById = request.ProcessedById;

                if (request.Status == "Refunded")
                {
                    // Cập nhật trạng thái đơn hàng thành Returned
                    orderReturn.Order.OrderStatus = "Returned";

                    // Cộng trả lại tồn kho cho các sản phẩm trong đơn hàng
                    foreach (var item in orderReturn.Order.OrderItems)
                    {
                        var product = await _dbContext.Products.FindAsync(item.ProductId);
                        if (product != null)
                        {
                            product.StockQuantity += item.Quantity;

                            var inventoryLog = new InventoryHistory
                            {
                                Id = Guid.NewGuid(),
                                ProductId = product.Id,
                                ChangeType = "Return",
                                QuantityChanged = item.Quantity,
                                NewStock = product.StockQuantity,
                                Note = $"Nhập trả hàng từ phiếu trả hàng ID: {orderReturn.Id}. Đơn gốc: {orderReturn.OrderId}",
                                ChangeDate = DateTime.UtcNow,
                                ChangedById = request.ProcessedById
                            };
                            _dbContext.InventoryHistories.Add(inventoryLog);
                        }
                    }
                }

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(orderReturn);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi xử lý duyệt trả hàng: {ex.Message}");
            }
        }

        public class CreateReturnRequest
        {
            public Guid OrderId { get; set; }
            public string Reason { get; set; }
        }

        public class ProcessReturnRequest
        {
            public string Status { get; set; } // Refunded hoặc Rejected
            public Guid? ProcessedById { get; set; }
        }
    }
}
