using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
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

        // Public access during development phase
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        // Public access during development phase
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Product product)
        {
            var existing = await _dbContext.Products.FindAsync(id);
            if (existing == null) return NotFound();

            // Cập nhật chính xác theo các trường dữ liệu của Model Laptop ban đầu
            existing.ProductCode = product.ProductCode;
            existing.Name = product.Name;
            existing.Brand = product.Brand;
            existing.Specifications = product.Specifications;
            existing.ImportPrice = product.ImportPrice;
            existing.Price = product.Price;
            existing.StockQuantity = product.StockQuantity;
            existing.LowStockThreshold = product.LowStockThreshold;

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
