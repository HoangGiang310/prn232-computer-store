using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;

namespace ComputerStoreApi.Controllers
{
    // UC-15: Đánh giá và Bình luận Sản phẩm
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        // Bộ lọc đơn giản chống spam / từ ngữ không phù hợp
        private static readonly string[] BannedWords = { "spam", "scam", "lừa đảo", "đm", "vcl" };

        public ReviewsController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Lấy danh sách đánh giá của một sản phẩm kèm thống kê trung bình sao
        // Hỗ trợ sắp xếp (helpful, newest, highest, lowest) và lọc theo số sao / có ảnh
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(
            Guid productId,
            [FromQuery] string sort = "helpful",
            [FromQuery] int? star = null)
        {
            var product = await _dbContext.Products.FindAsync(productId);
            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm." });

            // Chỉ hiển thị công khai các đánh giá chưa bị ẩn
            var query = _dbContext.ProductReviews
                .Where(r => r.ProductId == productId && !r.IsHidden);

            // Thống kê tính trên toàn bộ đánh giá hiển thị (trước khi lọc theo sao)
            var allVisible = await query.ToListAsync();
            var totalReviews = allVisible.Count;
            var averageRating = totalReviews > 0 ? Math.Round(allVisible.Average(r => r.Rating), 1) : 0;

            var distribution = Enumerable.Range(1, 5).ToDictionary(
                starLevel => starLevel,
                starLevel => allVisible.Count(r => r.Rating == starLevel));

            // Áp dụng bộ lọc theo số sao nếu có
            IEnumerable<ProductReview> filtered = star.HasValue && star.Value >= 1 && star.Value <= 5
                ? allVisible.Where(r => r.Rating == star.Value)
                : allVisible;

            // Sắp xếp danh sách theo lựa chọn người dùng
            filtered = sort switch
            {
                "newest" => filtered.OrderByDescending(r => r.CreatedAt),
                "highest" => filtered.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                "lowest" => filtered.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                _ => filtered.OrderByDescending(r => r.HelpfulCount).ThenByDescending(r => r.CreatedAt),
            };

            var reviews = filtered.Select(r => new
            {
                r.Id,
                r.ProductId,
                r.CustomerId,
                r.CustomerName,
                r.Rating,
                r.Title,
                r.Content,
                r.IsVerifiedPurchase,
                r.HelpfulCount,
                r.CreatedAt,
                r.UpdatedAt
            });

            return Ok(new
            {
                ProductId = productId,
                AverageRating = averageRating,
                TotalReviews = totalReviews,
                Distribution = distribution,
                Reviews = reviews
            });
        }

        // Tóm tắt nhanh trung bình sao + số lượng đánh giá (dùng cho trang danh sách sản phẩm)
        [HttpGet("product/{productId}/summary")]
        public async Task<IActionResult> GetSummary(Guid productId)
        {
            var reviews = await _dbContext.ProductReviews
                .Where(r => r.ProductId == productId && !r.IsHidden)
                .ToListAsync();

            return Ok(new
            {
                ProductId = productId,
                AverageRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0,
                TotalReviews = reviews.Count
            });
        }

        // Khách hàng đã đăng nhập kiểm tra xem mình có quyền đánh giá sản phẩm này không
        // (đã mua + đã giao) và đã từng đánh giá hay chưa
        [Authorize(Roles = "customer")]
        [HttpGet("product/{productId}/eligibility")]
        public async Task<IActionResult> CheckEligibility(Guid productId)
        {
            var customer = await GetCurrentCustomerAsync();
            if (customer == null) return Unauthorized();

            var hasPurchased = await HasPurchasedAsync(customer.Id, productId);
            var existingReview = await _dbContext.ProductReviews
                .FirstOrDefaultAsync(r => r.ProductId == productId && r.CustomerId == customer.Id);

            return Ok(new
            {
                CanReview = hasPurchased,
                HasReviewed = existingReview != null,
                ExistingReviewId = existingReview?.Id
            });
        }

        // Khách hàng gửi đánh giá mới (yêu cầu: đã mua sản phẩm)
        [Authorize(Roles = "customer")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
        {
            if (request == null || request.ProductId == Guid.Empty)
            {
                return BadRequest(new { message = "Dữ liệu đánh giá không hợp lệ." });
            }

            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new { message = "Số sao đánh giá phải nằm trong khoảng từ 1 đến 5." });
            }

            if (ContainsBannedWords(request.Title) || ContainsBannedWords(request.Content))
            {
                return BadRequest(new { message = "Bình luận của bạn chứa nội dung không phù hợp." });
            }

            var customer = await GetCurrentCustomerAsync();
            if (customer == null) return Unauthorized();

            var product = await _dbContext.Products.FindAsync(request.ProductId);
            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm." });

            // Xác thực khách thật sự đã mua sản phẩm này
            var hasPurchased = await HasPurchasedAsync(customer.Id, request.ProductId);
            if (!hasPurchased)
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { message = "Bạn chỉ có thể đánh giá sản phẩm đã mua và được giao thành công." });
            }

            // Mỗi khách chỉ có 1 đánh giá cho 1 sản phẩm (lần sau sẽ là chỉnh sửa)
            var existing = await _dbContext.ProductReviews
                .FirstOrDefaultAsync(r => r.ProductId == request.ProductId && r.CustomerId == customer.Id);
            if (existing != null)
            {
                return BadRequest(new { message = "Bạn đã đánh giá sản phẩm này. Vui lòng chỉnh sửa đánh giá cũ." });
            }

            var review = new ProductReview
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                Rating = request.Rating,
                Title = request.Title ?? string.Empty,
                Content = request.Content ?? string.Empty,
                IsVerifiedPurchase = true,
                IsHidden = false,
                HelpfulCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.ProductReviews.Add(review);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Đánh giá của bạn đã được gửi thành công!", review });
        }

        // Khách hàng chỉnh sửa đánh giá của chính mình
        [Authorize(Roles = "customer")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReviewRequest request)
        {
            var customer = await GetCurrentCustomerAsync();
            if (customer == null) return Unauthorized();

            var review = await _dbContext.ProductReviews.FindAsync(id);
            if (review == null) return NotFound();

            if (review.CustomerId != customer.Id)
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { message = "Bạn chỉ có thể sửa đánh giá của chính mình." });
            }

            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new { message = "Số sao đánh giá phải nằm trong khoảng từ 1 đến 5." });
            }

            if (ContainsBannedWords(request.Title) || ContainsBannedWords(request.Content))
            {
                return BadRequest(new { message = "Bình luận của bạn chứa nội dung không phù hợp." });
            }

            review.Rating = request.Rating;
            review.Title = request.Title ?? review.Title;
            review.Content = request.Content ?? review.Content;
            review.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật đánh giá thành công.", review });
        }

        // Khách hàng xóa đánh giá của chính mình
        [Authorize(Roles = "customer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var customer = await GetCurrentCustomerAsync();
            if (customer == null) return Unauthorized();

            var review = await _dbContext.ProductReviews.FindAsync(id);
            if (review == null) return NotFound();

            if (review.CustomerId != customer.Id)
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { message = "Bạn chỉ có thể xóa đánh giá của chính mình." });
            }

            _dbContext.ProductReviews.Remove(review);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        // Bất kỳ ai cũng có thể bấm "Hữu ích" để tăng lượt upvote cho 1 bình luận
        [HttpPost("{id}/helpful")]
        public async Task<IActionResult> MarkHelpful(Guid id)
        {
            var review = await _dbContext.ProductReviews.FindAsync(id);
            if (review == null) return NotFound();

            review.HelpfulCount += 1;
            await _dbContext.SaveChangesAsync();
            return Ok(new { review.Id, review.HelpfulCount });
        }

        // ADMIN: xem tất cả đánh giá (bao gồm cả đã ẩn) để kiểm duyệt
        [Authorize(Roles = "admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var reviews = await _dbContext.ProductReviews
                .Include(r => r.Product)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.ProductId,
                    ProductName = r.Product != null ? r.Product.Name : "Sản phẩm đã bị xóa",
                    r.CustomerName,
                    r.Rating,
                    r.Title,
                    r.Content,
                    r.IsHidden,
                    r.IsVerifiedPurchase,
                    r.HelpfulCount,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // ADMIN: ẩn / hiện một bình luận không phù hợp (soft hide, giữ lại để audit)
        [Authorize(Roles = "admin")]
        [HttpPut("{id}/visibility")]
        public async Task<IActionResult> SetVisibility(Guid id, [FromBody] SetVisibilityRequest request)
        {
            var review = await _dbContext.ProductReviews.FindAsync(id);
            if (review == null) return NotFound();

            review.IsHidden = request.IsHidden;
            await _dbContext.SaveChangesAsync();
            return Ok(new { review.Id, review.IsHidden });
        }

        // ===== Helper methods =====

        private async Task<Customer?> GetCurrentCustomerAsync()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username)) return null;
            return await _dbContext.Customers.FirstOrDefaultAsync(c => c.WebUsername == username);
        }

        // Khách được coi là "đã mua" khi có ít nhất 1 đơn chứa sản phẩm và đơn đã giao thành công
        private async Task<bool> HasPurchasedAsync(Guid customerId, Guid productId)
        {
            return await _dbContext.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.ProductId == productId
                                && oi.Order.CustomerId == customerId
                                && (oi.Order.OrderStatus == "Delivered" || oi.Order.OrderStatus == "Confirmed"));
        }

        private static bool ContainsBannedWords(string? text)
        {
            if (string.IsNullOrWhiteSpace(text)) return false;
            var lower = text.ToLower();
            return BannedWords.Any(w => lower.Contains(w));
        }

        public class CreateReviewRequest
        {
            public Guid ProductId { get; set; }
            public int Rating { get; set; }
            public string? Title { get; set; }
            public string? Content { get; set; }
        }

        public class UpdateReviewRequest
        {
            public int Rating { get; set; }
            public string? Title { get; set; }
            public string? Content { get; set; }
        }

        public class SetVisibilityRequest
        {
            public bool IsHidden { get; set; }
        }
    }
}
