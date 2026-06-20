using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.DTOs;
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

        // Tạo Voucher mới (dùng DTO + validation)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVoucherDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var code = dto.Code.Trim().ToUpper();

            var existing = await _dbContext.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (existing != null)
            {
                return BadRequest(new { message = "Mã voucher đã tồn tại trong hệ thống." });
            }

            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest(new { message = "Ngày kết thúc phải sau ngày bắt đầu." });
            }

            if (dto.DiscountType == "Percentage" && dto.DiscountValue > 100)
            {
                return BadRequest(new { message = "Giảm theo phần trăm không được vượt quá 100%." });
            }

            var voucher = new Voucher
            {
                Code = code,
                Name = dto.Name.Trim(),
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                MinOrderValue = dto.MinOrderValue,
                TotalUsageLimit = dto.TotalUsageLimit,
                UsedCount = 0,
                StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc)
            };

            _dbContext.Vouchers.Add(voucher);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByCode), new { code = voucher.Code }, voucher);
        }

        // Cập nhật Voucher (dùng DTO + validation)
        [HttpPut("{code}")]
        public async Task<IActionResult> Update(string code, [FromBody] UpdateVoucherDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _dbContext.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (existing == null) return NotFound(new { message = "Không tìm thấy voucher." });

            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest(new { message = "Ngày kết thúc phải sau ngày bắt đầu." });
            }

            if (dto.DiscountType == "Percentage" && dto.DiscountValue > 100)
            {
                return BadRequest(new { message = "Giảm theo phần trăm không được vượt quá 100%." });
            }

            existing.Name = dto.Name.Trim();
            existing.DiscountType = dto.DiscountType;
            existing.DiscountValue = dto.DiscountValue;
            existing.MinOrderValue = dto.MinOrderValue;
            existing.TotalUsageLimit = dto.TotalUsageLimit;
            existing.UsedCount = dto.UsedCount;
            existing.StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
            existing.EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc);

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
