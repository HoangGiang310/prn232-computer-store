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
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public OrdersController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Public access during development phase
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.Shipment)
                .Include(o => o.Customer)
                .ToListAsync();
            return Ok(orders);
        }

        // Public access during development phase
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.Shipment)
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            return Ok(order);
        }

        // Public access during development phase
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            if (order.OrderItems == null || !order.OrderItems.Any())
            {
                return BadRequest("Đơn hàng phải có ít nhất một sản phẩm.");
            }

            if (!order.CustomerId.HasValue && User.Identity?.IsAuthenticated == true)
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (!string.IsNullOrEmpty(username))
                {
                    var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.WebUsername == username);
                    if (customer == null)
                    {
                        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == username);
                        if (user != null)
                        {
                            customer = new Customer
                            {
                                Id = Guid.NewGuid(),
                                FullName = user.FullName,
                                PhoneNumber = string.IsNullOrEmpty(user.Email) ? "0000000000" : "0000000000",
                                Email = user.Email,
                                Address = string.Empty,
                                Notes = "Tự động tạo khách hàng từ tài khoản web.",
                                WebUsername = username,
                                WebPasswordHash = user.PasswordHash,
                                CreatedAt = DateTime.UtcNow
                            };
                            _dbContext.Customers.Add(customer);
                            await _dbContext.SaveChangesAsync();
                        }
                    }

                    if (customer != null)
                    {
                        order.CustomerId = customer.Id;
                    }
                }
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                order.Id = Guid.NewGuid();
                order.CreatedAt = DateTime.UtcNow;
                order.OrderStatus = string.IsNullOrEmpty(order.OrderStatus)
                    ? order.OrderChannel == "Offline"
                        ? "Delivered"
                        : "New"
                    : order.OrderStatus;

                order.TotalAmount = 0;
                order.DiscountAmount = 0;
                order.ShippingFee = order.ShippingFee;
                order.FinalAmount = 0;

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

                    item.OrderId = order.Id;
                    item.UnitPrice = product.Price;
                    order.TotalAmount += item.UnitPrice * item.Quantity;

                    product.StockQuantity -= item.Quantity;
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

                if (!string.IsNullOrEmpty(order.VoucherCode))
                {
                    var voucher = await _dbContext.Vouchers.FirstOrDefaultAsync(v => v.Code == order.VoucherCode);
                    if (voucher == null)
                    {
                        return BadRequest("Voucher không tồn tại hoặc đã hết hạn.");
                    }

                    if (DateTime.UtcNow < voucher.StartDate || DateTime.UtcNow > voucher.EndDate)
                    {
                        return BadRequest("Voucher không nằm trong thời gian áp dụng.");
                    }

                    if (voucher.UsedCount >= voucher.TotalUsageLimit)
                    {
                        return BadRequest("Voucher đã đạt giới hạn số lần sử dụng.");
                    }

                    if (order.TotalAmount < voucher.MinOrderValue)
                    {
                        return BadRequest($"Đơn hàng phải đạt tối thiểu {voucher.MinOrderValue:N0} để áp dụng voucher.");
                    }

                    order.DiscountAmount = voucher.DiscountType switch
                    {
                        "Percentage" => Math.Round(order.TotalAmount * voucher.DiscountValue / 100, 2),
                        "FixedAmount" => voucher.DiscountValue,
                        _ => 0
                    };

                    order.DiscountAmount = Math.Min(order.DiscountAmount, order.TotalAmount);
                    voucher.UsedCount += 1;
                    _dbContext.Vouchers.Update(voucher);
                }

                order.FinalAmount = Math.Max(order.TotalAmount - order.DiscountAmount + order.ShippingFee, 0);

                _dbContext.Orders.Add(order);
                await _dbContext.SaveChangesAsync();

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
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] Order orderUpdate)
        {
            var existing = await _dbContext.Orders.FindAsync(id);
            if (existing == null) return NotFound();

            var previousStatus = existing.OrderStatus;
            existing.OrderStatus = orderUpdate.OrderStatus ?? existing.OrderStatus;
            existing.OrderChannel = orderUpdate.OrderChannel ?? existing.OrderChannel;
            existing.TotalAmount = orderUpdate.TotalAmount;
            existing.DiscountAmount = orderUpdate.DiscountAmount;
            existing.ShippingFee = orderUpdate.ShippingFee;
            existing.FinalAmount = orderUpdate.FinalAmount;
            existing.IsPaid = orderUpdate.IsPaid;
            existing.ShippingName = orderUpdate.ShippingName ?? existing.ShippingName;
            existing.ShippingPhone = orderUpdate.ShippingPhone ?? existing.ShippingPhone;
            existing.ShippingAddress = orderUpdate.ShippingAddress ?? existing.ShippingAddress;

            if ((existing.OrderStatus == "Cancelled" || existing.OrderStatus == "Returned") &&
                previousStatus != "Cancelled" && previousStatus != "Returned")
            {
                var orderItems = await _dbContext.OrderItems
                    .Where(oi => oi.OrderId == id)
                    .ToListAsync();

                foreach (var item in orderItems)
                {
                    var product = await _dbContext.Products.FindAsync(item.ProductId);
                    if (product == null) continue;

                    product.StockQuantity += item.Quantity;
                    var history = new InventoryHistory
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        ChangeType = existing.OrderStatus == "Returned" ? "Return" : "Adjustment",
                        QuantityChanged = item.Quantity,
                        NewStock = product.StockQuantity,
                        Note = $"Hoàn tồn kho do đơn {existing.OrderStatus}. ID Đơn: {existing.Id}",
                        ChangeDate = DateTime.UtcNow,
                        ChangedById = existing.CreatedById
                    };
                    _dbContext.InventoryHistories.Add(history);
                }
            }

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/shipment")]
        public async Task<IActionResult> UpdateShipment(Guid id, [FromBody] ShipmentUpdateRequest request)
        {
            var order = await _dbContext.Orders
                .Include(o => o.Shipment)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            if (order.Shipment == null)
            {
                order.Shipment = new Shipment
                {
                    OrderId = order.Id,
                    Carrier = request.Carrier,
                    TrackingNumber = request.TrackingNumber,
                    ShipmentStatus = request.ShipmentStatus,
                    ShippedAt = request.ShipmentStatus == "Shipping" ? DateTime.UtcNow : null,
                    DeliveredAt = request.ShipmentStatus == "Delivered" ? DateTime.UtcNow : null
                };
                _dbContext.Shipments.Add(order.Shipment);
            }
            else
            {
                order.Shipment.Carrier = request.Carrier ?? order.Shipment.Carrier;
                order.Shipment.TrackingNumber = request.TrackingNumber ?? order.Shipment.TrackingNumber;
                order.Shipment.ShipmentStatus = request.ShipmentStatus ?? order.Shipment.ShipmentStatus;
                if (request.ShipmentStatus == "Shipping" && order.Shipment.ShippedAt == null)
                {
                    order.Shipment.ShippedAt = DateTime.UtcNow;
                }
                if (request.ShipmentStatus == "Delivered")
                {
                    order.Shipment.DeliveredAt = DateTime.UtcNow;
                }
            }

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        public class ShipmentUpdateRequest
        {
            public string Carrier { get; set; }
            public string TrackingNumber { get; set; }
            public string ShipmentStatus { get; set; }
        }
    }
}
