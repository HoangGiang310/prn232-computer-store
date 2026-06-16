using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;

namespace ComputerStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public VouchersController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Lấy danh sách Voucher
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vouchers = await _dbContext.Vouchers
                .OrderByDescending(v => v.StartDate)
                .ToListAsync();
            return Ok(vouchers);
        }

        // Lấy thông tin chi tiết hoặc kiểm tra tính hợp lệ của voucher
        [HttpGet("{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            var voucher = await _dbContext.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (voucher == null) return NotFound(new { message = "Voucher không tồn tại." });

            return Ok(voucher);
        }

        // Tạo Voucher mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Voucher voucher)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _dbContext.Vouchers.FirstOrDefaultAsync(v => v.Code == voucher.Code);
            if (existing != null)
            {
                return BadRequest(new { message = "Mã voucher đã tồn tại trong hệ thống." });
            }

            voucher.StartDate = DateTime.SpecifyKind(voucher.StartDate, DateTimeKind.Utc);
            voucher.EndDate = DateTime.SpecifyKind(voucher.EndDate, DateTimeKind.Utc);

            _dbContext.Vouchers.Add(voucher);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByCode), new { code = voucher.Code }, voucher);
        }

        // Cập nhật Voucher
        [HttpPut("{code}")]
        public async Task<IActionResult> Update(string code, [FromBody] Voucher voucher)
        {
            var existing = await _dbContext.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (existing == null) return NotFound();

            existing.Name = voucher.Name;
            existing.DiscountType = voucher.DiscountType;
            existing.DiscountValue = voucher.DiscountValue;
            existing.MinOrderValue = voucher.MinOrderValue;
            existing.TotalUsageLimit = voucher.TotalUsageLimit;
            existing.UsedCount = voucher.UsedCount;
            existing.StartDate = DateTime.SpecifyKind(voucher.StartDate, DateTimeKind.Utc);
            existing.EndDate = DateTime.SpecifyKind(voucher.EndDate, DateTimeKind.Utc);

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        // Xóa Voucher
        [HttpDelete("{code}")]
        public async Task<IActionResult> Delete(string code)
        {
            var voucher = await _dbContext.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (voucher == null) return NotFound();

            _dbContext.Vouchers.Remove(voucher);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
