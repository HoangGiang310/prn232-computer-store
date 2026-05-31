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

        // Chỉ Admin, nhân viên kho (warehouse) hoặc bán hàng (sales) mới được tạo sản phẩm
        [Authorize(Roles = "admin,sales,warehouse")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        // Chỉ Admin hoặc các bộ phận quản lý liên quan mới được sửa thông tin laptop
        [Authorize(Roles = "admin,sales,warehouse")]
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

        // Nghiêm cấm nhân viên tự ý xóa sản phẩm - Chỉ cấu hình cho quyền tối cao (Admin)
        [Authorize(Roles = "admin")]
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
