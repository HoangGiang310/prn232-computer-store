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

        // Lấy danh sách toàn bộ đơn hàng kèm theo chi tiết sản phẩm mua
        [Authorize(Roles = "admin,sales,accountant,warehouse,customer")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Shipment)
                .ToListAsync();
            return Ok(orders);
        }

        // Xem chi tiết một đơn hàng cụ thể
        [Authorize(Roles = "admin,sales,accountant,warehouse,customer")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.Shipment)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            return Ok(order);
        }

        // Tạo đơn hàng mới + Kiểm tra và trừ kho thời gian thực + Ghi lịch sử kho
        [Authorize(Roles = "admin,sales,customer")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            if (order.OrderItems == null || !order.OrderItems.Any())
            {
                return BadRequest("Đơn hàng phải có ít nhất một sản phẩm.");
            }

            // Sử dụng Database Transaction để đảm bảo nếu trừ kho lỗi thì hủy toàn bộ đơn hàng
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                order.CreatedAt = DateTime.UtcNow;

                // Mặc định trạng thái đơn tùy theo kênh bán
                if (string.IsNullOrEmpty(order.OrderStatus))
                {
                    order.OrderStatus = order.OrderChannel == "Offline" ? "Delivered" : "New";
                }

                // Vòng lặp kiểm tra tồn kho của từng laptop trong đơn hàng
                foreach (var item in order.OrderItems)
                {
                    var product = await _dbContext.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        return NotFound($"Không tìm thấy sản phẩm có ID: {item.ProductId}");
                    }

                    if (product.StockQuantity < item.Quantity)
                    {
                        return BadRequest($"Sản phẩm '{product.Name}' không đủ hàng trong kho (Còn lại: {product.StockQuantity}).");
                    }

                    // Thực hiện trừ kho thực tế của Laptop
                    product.StockQuantity -= item.Quantity;

                    // Ghi nhận nhật ký thay đổi kho để quản lý kho đối soát
                    var inventoryLog = new InventoryHistory
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        ChangeType = order.OrderChannel == "Offline" ? "Export_POS" : "Export_Online",
                        QuantityChanged = -item.Quantity,
                        NewStock = product.StockQuantity,
                        Note = $"Trừ kho tự động từ đơn hàng {order.OrderChannel}. ID Đơn: {order.Id}",
                        ChangeDate = DateTime.UtcNow,
                        ChangedById = order.CreatedById
                    };
                    _dbContext.InventoryHistories.Add(inventoryLog);
                }

                _dbContext.Orders.Add(order);
                await _dbContext.SaveChangesAsync();

                // Xác nhận giao dịch thành công hoàn toàn
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Đã xảy ra lỗi hệ thống khi xử lý đơn hàng: {ex.Message}");
            }
        }

        // Cập nhật trạng thái đơn hàng (Dành cho Admin, nhân viên POS hoặc thủ kho giao vận)
        [Authorize(Roles = "admin,sales,warehouse")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] Order orderUpdate)
        {
            var existing = await _dbContext.Orders.FindAsync(id);
            if (existing == null) return NotFound();

            // Cập nhật các trường trạng thái, thông tin giao nhận
            existing.OrderStatus = orderUpdate.OrderStatus;
            existing.OrderChannel = orderUpdate.OrderChannel;
            existing.TotalAmount = orderUpdate.TotalAmount;
            existing.DiscountAmount = orderUpdate.DiscountAmount;
            existing.ShippingFee = orderUpdate.ShippingFee;
            existing.FinalAmount = orderUpdate.FinalAmount;
            existing.IsPaid = orderUpdate.IsPaid;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
