using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Authorize(Roles = "admin,accountant,bookkeeper")]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public ReportsController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Báo cáo doanh thu và lợi nhuận
        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            start = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            end = DateTime.SpecifyKind(end, DateTimeKind.Utc);

            var orders = await _dbContext.Orders
                .Where(o => o.CreatedAt >= start && o.CreatedAt <= end && o.OrderStatus != "Cancelled")
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();

            decimal totalRevenue = orders.Sum(o => o.FinalAmount);
            
            // Tính Lợi nhuận = Doanh thu - Giá vốn nhập hàng (COGS)
            decimal totalCOGS = 0;
            foreach (var order in orders)
            {
                foreach (var item in order.OrderItems)
                {
                    totalCOGS += item.Quantity * (item.Product?.ImportPrice ?? 0);
                }
            }
            decimal totalProfit = totalRevenue - totalCOGS;

            int totalOrders = orders.Count;
            int onlineOrders = orders.Count(o => o.OrderChannel == "Online");
            int offlineOrders = orders.Count(o => o.OrderChannel == "Offline");

            // Nhóm doanh thu theo ngày
            var dailyStats = orders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(o => o.FinalAmount),
                    OrderCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            return Ok(new
            {
                StartDate = start,
                EndDate = end,
                TotalRevenue = totalRevenue,
                TotalProfit = totalProfit,
                TotalOrders = totalOrders,
                OnlineOrders = onlineOrders,
                OfflineOrders = offlineOrders,
                DailyStats = dailyStats
            });
        }

        // Thống kê sản phẩm bán chạy nhất
        [HttpGet("top-selling")]
        public async Task<IActionResult> GetTopSellingProducts([FromQuery] int limit = 5)
        {
            var items = await _dbContext.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Order)
                .Where(oi => oi.Order.OrderStatus != "Cancelled")
                .ToListAsync();

            var topProducts = items
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    ProductCode = g.First().Product?.ProductCode ?? "UNKNOWN",
                    Name = g.First().Product?.Name ?? "Sản phẩm đã bị xóa",
                    Category = g.First().Product?.Category ?? string.Empty,
                    Brand = g.First().Product?.Brand ?? "",
                    QuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
                })
                .OrderByDescending(p => p.QuantitySold)
                .Take(limit)
                .ToList();

            return Ok(topProducts);
        }

        // Thống kê trạng thái kho hàng
        [HttpGet("inventory-status")]
        public async Task<IActionResult> GetInventoryStatus()
        {
            var products = await _dbContext.Products.ToListAsync();

            int totalProducts = products.Count;
            int outOfStock = products.Count(p => p.StockQuantity == 0);
            int lowStock = products.Count(p => p.StockQuantity > 0 && p.StockQuantity <= p.LowStockThreshold);
            int normalStock = products.Count(p => p.StockQuantity > p.LowStockThreshold);

            var lowStockItems = products
                .Where(p => p.StockQuantity <= p.LowStockThreshold)
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.Name,
                    p.Category,
                    p.StockQuantity,
                    p.LowStockThreshold
                })
                .ToList();

            return Ok(new
            {
                TotalProducts = totalProducts,
                OutOfStockCount = outOfStock,
                LowStockCount = lowStock,
                NormalStockCount = normalStock,
                LowStockItems = lowStockItems
            });
        }
    }
}
