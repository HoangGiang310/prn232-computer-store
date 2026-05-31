using ComputerStoreApi.Data;
using ComputerStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ComputerStoreApi.Services
{

    public class DatabaseSeeder
    {
        private readonly AppDbContext _context;

        public DatabaseSeeder(AppDbContext context)
        {
            _context = context;
        }

        public void SeedAllData()
        {
            // Đảm bảo database đã được tạo
            //_context.Database.EnsureCreated();

            _context.Database.Migrate();

            // 1. INSERT VAI TRÒ (ROLES)
            if (!_context.Roles.Any())
            {
                var roles = new List<Role>
                {
                    new Role { RoleName = "admin", Description = "Quản trị tối cao hệ thống" },
                    new Role { RoleName = "sales", Description = "Nhân viên bán hàng tại POS" },
                    new Role { RoleName = "accountant", Description = "Kế toán tài chính, báo cáo" },
                    new Role { RoleName = "warehouse", Description = "Quản lý xuất nhập tồn kho" },
                    new Role { RoleName = "customer", Description = "Khách hàng mua Online" }
                };
                _context.Roles.AddRange(roles);
                _context.SaveChanges();
            }

            // 2. INSERT TÀI KHOẢN NHÂN VIÊN (USERS)
            if (!_context.Users.Any())
            {
                string fakeHashPassword = "Mã_Hóa_Password_123_Của_Hệ_Thống";

                var users = new List<User>
                {
                    new User { Username = "admin_01", PasswordHash = fakeHashPassword, FullName = "Nguyễn Văn Admin", RoleName = "admin", Email = "admin01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Username = "sales_01", PasswordHash = fakeHashPassword, FullName = "Trần Thị Bán Hàng", RoleName = "sales", Email = "sales01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Username = "acc_01", PasswordHash = fakeHashPassword, FullName = "Phạm Kế Toán", RoleName = "accountant", Email = "accountant01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Username = "kho_01", PasswordHash = fakeHashPassword, FullName = "Lê Thủ Kho", RoleName = "warehouse", Email = "warehouse01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow }
                };
                _context.Users.AddRange(users);
                _context.SaveChanges();
            }

            // 3. INSERT KHÁCH HÀNG (CUSTOMERS)
            if (!_context.Customers.Any())
            {
                var customers = new List<Customer>
                {
                    new Customer {
                        FullName = "Khách Vãng Lai POS",
                        PhoneNumber = "0000000000",
                        Address = "Tại cửa hàng",
                        Email = "khachvanglai@computerstore.local",
                        Notes = "Khách mua trực tiếp không để lại thông tin",
                        WebUsername = "khachvanglai_pos",         // Vượt lỗi WebUsername NOT NULL
                        WebPasswordHash = "no_password_pos",       // Vượt lỗi WebPasswordHash NOT NULL
                        CreatedAt = DateTime.UtcNow
                    },
                    new Customer {
                        FullName = "Trần Hoàng Long",
                        PhoneNumber = "0912345678",
                        Email = "longth@gmail.com",
                        Address = "123 Nguyễn Huệ, Quận 1, TPHCM",
                        WebUsername = "longkhachhang",
                        WebPasswordHash = "hashed_customer_password",
                        Notes = "Khách hàng thân thiết mua Online",
                        CreatedAt = DateTime.UtcNow
                    }
                };
                _context.Customers.AddRange(customers);
                _context.SaveChanges();
            }

            // 4. INSERT SẢN PHẨM LAPTOP (PRODUCTS)
            if (!_context.Products.Any())
            {
                var p1 = new Product
                {
                    ProductCode = "LAP-DELL-XPS13",
                    Name = "Laptop Dell XPS 13 9320",
                    Brand = "Dell",
                    Specifications = "Core i7-1260P, 16GB RAM, 512GB SSD, 13.4 OLED Touch",
                    ImportPrice = 32000000,
                    Price = 38500000,
                    StockQuantity = 15,
                    LowStockThreshold = 3,
                    CreatedAt = DateTime.UtcNow
                };

                var p2 = new Product
                {
                    ProductCode = "LAP-MAC-M3AIR",
                    Name = "MacBook Air 13 inch M3 2024",
                    Brand = "Apple",
                    Specifications = "Apple M3 chip, 8-core CPU, 10-core GPU, 16GB Unified Memory, 512GB SSD",
                    ImportPrice = 28000000,
                    Price = 32990000,
                    StockQuantity = 2,
                    LowStockThreshold = 3,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Products.AddRange(p1, p2);
                _context.SaveChanges();

                _context.ProductImages.AddRange(
                    new ProductImage { ProductId = p1.Id, ImageUrl = "https://cdn.example.com/dell-xps-1.jpg", IsMain = true },
                    new ProductImage { ProductId = p1.Id, ImageUrl = "https://cdn.example.com/dell-xps-detail.jpg", IsMain = false },
                    new ProductImage { ProductId = p2.Id, ImageUrl = "https://cdn.example.com/macbook-m3.jpg", IsMain = true }
                );
                _context.SaveChanges();
            }

            // 5. INSERT MÃ GIẢM GIÁ (VOUCHERS)
            if (!_context.Vouchers.Any())
            {
                DateTime rawStartDate = DateTime.UtcNow.AddDays(-5);
                DateTime rawEndDate = DateTime.UtcNow.AddDays(30);

                _context.Vouchers.AddRange(
                    new Voucher
                    {
                        Code = "GIAMGIAMAYTINH",
                        Name = "Khuyến mãi Laptop mới 2026",
                        DiscountType = "FixedAmount",
                        DiscountValue = 500000,
                        MinOrderValue = 10000000,
                        TotalUsageLimit = 100,
                        StartDate = DateTime.SpecifyKind(rawStartDate, DateTimeKind.Utc),
                        EndDate = DateTime.SpecifyKind(rawEndDate, DateTimeKind.Utc)
                    }
                );
                _context.SaveChanges();
            }

            // ==========================================
            // 6. TẠO ĐƠN HÀNG MẪU - FIX TRIỆT ĐỂ LỖI NULL ID
            // ==========================================
            if (!_context.Orders.Any())
            {
                // Lấy khách hàng và sản phẩm có sẵn
                var targetCustomer = _context.Customers.FirstOrDefault(c => c.PhoneNumber == "0912345678")
                                    ?? _context.Customers.FirstOrDefault(); // Nếu không có thì lấy đại diện thằng đầu tiên

                var targetProduct = _context.Products.FirstOrDefault(p => p.ProductCode == "LAP-DELL-XPS13");

                // Tìm nhân viên bán hàng
                var salesUser = _context.Users.FirstOrDefault(u => u.Username == "sales_01")
                                ?? _context.Users.FirstOrDefault(); // Nếu không thấy sales_01, lấy tài khoản đầu tiên tránh bị null

                if (targetCustomer != null && targetProduct != null)
                {
                    var sampleOrder = new Order
                    {
                        OrderChannel = "Offline",
                        OrderStatus = "Delivered",
                        PaymentMethod = "Card",
                        IsPaid = true,
                        CustomerId = targetCustomer.Id,
                        ShippingName = targetCustomer.FullName ?? "Khách nhận tại quầy",
                        ShippingPhone = targetCustomer.PhoneNumber ?? "0000000000",
                        ShippingAddress = "Nhận trực tiếp tại Store",
                        TotalAmount = targetProduct.Price,
                        DiscountAmount = 0,
                        ShippingFee = 0,
                        FinalAmount = targetProduct.Price,

                        // Nếu tìm thấy nhân viên thì gán ID, nếu database trống hoàn toàn (null) thì không gán trường này
                        CreatedById = salesUser?.Id,

                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Orders.Add(sampleOrder);
                    _context.SaveChanges();

                    // 6.1 Tạo chi tiết đơn hàng
                    var sampleItem = new OrderItem
                    {
                        OrderId = sampleOrder.Id,
                        ProductId = targetProduct.Id,
                        Quantity = 1,
                        UnitPrice = targetProduct.Price
                    };
                    _context.OrderItems.Add(sampleItem);

                    // 6.2 Lưu lịch sử kho hàng
                    var invHistory = new InventoryHistory
                    {
                        ProductId = targetProduct.Id,
                        ChangeType = "Export_POS",
                        QuantityChanged = -1,
                        NewStock = targetProduct.StockQuantity - 1,
                        Note = $"Xuất bán tại quầy POS cho đơn hàng ID: {sampleOrder.Id}",
                        ChangedById = salesUser?.Id,
                        ChangeDate = DateTime.UtcNow
                    };
                    _context.InventoryHistories.Add(invHistory);

                    // Cập nhật lại số lượng tồn kho của sản phẩm
                    targetProduct.StockQuantity -= 1;
                    _context.SaveChanges();
                }
            }
        }
    }
}