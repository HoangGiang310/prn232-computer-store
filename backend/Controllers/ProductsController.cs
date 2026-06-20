using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.DTOs;
using ComputerStoreApi.Models;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public ProductsController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private IQueryable<Product> ApplyFilters(
            IQueryable<Product> query,
            string? search,
            string? brand,
            decimal? minPrice,
            decimal? maxPrice,
            string? stockStatus)
        {
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(p =>
                    p.Name.Contains(term) ||
                    p.ProductCode.Contains(term) ||
                    p.Brand.Contains(term) ||
                    p.Specifications.Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(brand))
            {
                query = query.Where(p => p.Brand.ToLower() == brand.Trim().ToLower());
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrWhiteSpace(stockStatus))
            {
                switch (stockStatus.Trim().ToLower())
                {
                    case "instock":
                    case "con-hang":
                        query = query.Where(p => p.StockQuantity > 0);
                        break;
                    case "lowstock":
                    case "gan-het":
                        query = query.Where(p => p.StockQuantity > 0 && p.StockQuantity <= p.LowStockThreshold);
                        break;
                    case "outofstock":
                    case "het-hang":
                        query = query.Where(p => p.StockQuantity == 0);
                        break;
                }
            }

            return query;
        }

        // Lấy danh sách sản phẩm kèm theo danh sách ảnh, hỗ trợ tìm kiếm và lọc
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? brand,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? stockStatus)
        {
            var query = _dbContext.Products
                .Include(p => p.Images)
                .AsQueryable();

            query = ApplyFilters(query, search, brand, minPrice, maxPrice, stockStatus);

            var products = await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(products);
        }

        // Xem chi tiết sản phẩm cùng thông số kỹ thuật đầy đủ và hình ảnh
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var product = await _dbContext.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();
            return Ok(product);
        }

        // Tạo sản phẩm mới (dùng DTO + validation)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Kiểm tra trùng mã sản phẩm
            var codeExists = await _dbContext.Products.AnyAsync(p => p.ProductCode == dto.ProductCode);
            if (codeExists)
            {
                return BadRequest(new { message = $"Mã sản phẩm '{dto.ProductCode}' đã tồn tại." });
            }

            // Quy tắc nghiệp vụ: giá bán không nên nhỏ hơn giá nhập
            if (dto.Price < dto.ImportPrice)
            {
                return BadRequest(new { message = "Giá bán không được nhỏ hơn giá nhập." });
            }

            var product = new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = dto.ProductCode.Trim(),
                Name = dto.Name.Trim(),
                Brand = dto.Brand.Trim(),
                Specifications = dto.Specifications,
                ImportPrice = dto.ImportPrice,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                LowStockThreshold = dto.LowStockThreshold,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        // Cập nhật sản phẩm (dùng DTO + validation)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProductDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _dbContext.Products.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Không tìm thấy sản phẩm." });

            // Kiểm tra trùng mã với sản phẩm khác
            var codeTaken = await _dbContext.Products
                .AnyAsync(p => p.ProductCode == dto.ProductCode && p.Id != id);
            if (codeTaken)
            {
                return BadRequest(new { message = $"Mã sản phẩm '{dto.ProductCode}' đã được dùng cho sản phẩm khác." });
            }

            if (dto.Price < dto.ImportPrice)
            {
                return BadRequest(new { message = "Giá bán không được nhỏ hơn giá nhập." });
            }

            existing.ProductCode = dto.ProductCode.Trim();
            existing.Name = dto.Name.Trim();
            existing.Brand = dto.Brand.Trim();
            existing.Specifications = dto.Specifications;
            existing.ImportPrice = dto.ImportPrice;
            existing.Price = dto.Price;
            existing.StockQuantity = dto.StockQuantity;
            existing.LowStockThreshold = dto.LowStockThreshold;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _dbContext.Products.FindAsync(id);
            if (existing == null) return NotFound();

            _dbContext.Products.Remove(existing);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        public class ProductCreateRequest
        {
            public string ProductCode { get; set; }
            public string Name { get; set; }
            public string Brand { get; set; }
            public string Specifications { get; set; }
            public decimal ImportPrice { get; set; }
            public decimal Price { get; set; }
            public int StockQuantity { get; set; }
            public int LowStockThreshold { get; set; }
            public List<string>? ImageUrls { get; set; }
        }
    }
}
