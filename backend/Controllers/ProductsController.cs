using Microsoft.AspNetCore.Authorization;
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

        // Lấy danh sách sản phẩm kèm theo danh sách ảnh (hiển thị thumbnail)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _dbContext.Products
                .Include(p => p.Images)
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

        // Public access during development phase
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _dbContext.Products.FindAsync(id);
            if (existing == null) return NotFound();

            _dbContext.Products.Remove(existing);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
