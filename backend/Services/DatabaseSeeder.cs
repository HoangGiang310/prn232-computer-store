using ComputerStoreApi.Data;
using ComputerStoreApi.Models;
using Microsoft.AspNetCore.Identity;
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
                // Dùng PasswordHasher giống hệt AuthController để mật khẩu đăng nhập được
                var passwordHasher = new PasswordHasher<User>();

                var users = new List<User>
                {
                    new User { Username = "admin_01", FullName = "Nguyễn Văn Admin", RoleName = "admin", Email = "admin01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Username = "sales_01", FullName = "Trần Thị Bán Hàng", RoleName = "sales", Email = "sales01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Username = "acc_01", FullName = "Phạm Kế Toán", RoleName = "accountant", Email = "accountant01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { Username = "kho_01", FullName = "Lê Thủ Kho", RoleName = "warehouse", Email = "warehouse01@computerstore.local", IsActive = true, CreatedAt = DateTime.UtcNow }
                };

                // Mật khẩu mặc định cho tất cả tài khoản nhân viên mẫu: "Password@123"
                foreach (var u in users)
                {
                    u.PasswordHash = passwordHasher.HashPassword(u, "Password@123");
                }

                _context.Users.AddRange(users);
                _context.SaveChanges();
            }

            // 2b. ĐẢM BẢO CÁC TÀI KHOẢN MẪU LUÔN ĐĂNG NHẬP ĐƯỢC
            // Chạy mỗi lần khởi động: tạo nếu thiếu, đặt lại mật khẩu "Password@123" nếu hash không hợp lệ.
            // Nhờ vậy dù database cũ ở trạng thái nào, 5 tài khoản mẫu vẫn luôn dùng được.
            EnsureSampleAccounts();

            // 3. INSERT KHÁCH HÀNG VÃNG LAI (CUSTOMERS)
            // Khách online "longkhachhang" và tài khoản đăng nhập của họ được tạo ở EnsureSampleAccounts().
            if (!_context.Customers.Any(c => c.WebUsername == "khachvanglai_pos"))
            {
                // Khách vãng lai tại quầy (không có tài khoản đăng nhập online)
                var walkInCustomer = new Customer
                {
                    FullName = "Khách Vãng Lai POS",
                    PhoneNumber = "0000000000",
                    Address = "Tại cửa hàng",
                    Email = "khachvanglai@computerstore.local",
                    Notes = "Khách mua trực tiếp không để lại thông tin",
                    WebUsername = "khachvanglai_pos",         // Vượt lỗi WebUsername NOT NULL
                    WebPasswordHash = "no_password_pos",       // Vượt lỗi WebPasswordHash NOT NULL
                    CreatedAt = DateTime.UtcNow
                };

                _context.Customers.Add(walkInCustomer);
                _context.SaveChanges();
            }

            // 4. INSERT SẢN PHẨM LAPTOP & PHỤ KIỆN (PRODUCTS)
            if (!_context.Products.Any())
            {
                // Ảnh dùng nguồn Unsplash (miễn phí, có thật) để hiển thị đẹp trên giao diện
                var products = new List<(Product product, string image)>
            {
                // === NHÓM LAPTOP ===
                (new Product { ProductCode = "LAP-DELL-XPS13", Name = "Dell XPS 13 9320", Category = "Laptop", Brand = "Dell",
                    Specifications = "Intel Core i7-1260P, 16GB LPDDR5, 512GB SSD, 13.4\" OLED 3.5K Touch, Windows 11",
                    ImportPrice = 32000000, Price = 38500000, StockQuantity = 15, LowStockThreshold = 3, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80"), // Ảnh laptop Dell/XPS

                (new Product { ProductCode = "LAP-MAC-M3AIR", Name = "MacBook Air 13\" M3 2024", Category = "Laptop", Brand = "Apple",
                    Specifications = "Apple M3 8-core CPU, 10-core GPU, 16GB Unified Memory, 512GB SSD, 13.6\" Liquid Retina",
                    ImportPrice = 28000000, Price = 32990000, StockQuantity = 8, LowStockThreshold = 3, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"), // Ảnh Macbook Air mặt nghiêng

                (new Product { ProductCode = "LAP-MAC-M3PRO16", Name = "MacBook Pro 16\" M3 Pro", Category = "Laptop", Brand = "Apple",
                    Specifications = "Apple M3 Pro 12-core CPU, 18-core GPU, 36GB RAM, 1TB SSD, 16.2\" Liquid Retina XDR",
                    ImportPrice = 58000000, Price = 65990000, StockQuantity = 5, LowStockThreshold = 2, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"), // Ảnh Macbook Pro không gian tối

                (new Product { ProductCode = "LAP-ASUS-ROG16", Name = "ASUS ROG Strix G16", Category = "Laptop", Brand = "ASUS",
                    Specifications = "Intel Core i9-14900HX, 32GB DDR5, 1TB SSD, RTX 4070 8GB, 16\" QHD+ 240Hz",
                    ImportPrice = 42000000, Price = 49990000, StockQuantity = 7, LowStockThreshold = 3, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"), // Ảnh laptop gaming góc cạnh

                (new Product { ProductCode = "LAP-ASUS-ZEN14", Name = "ASUS Zenbook 14 OLED", Category = "Laptop", Brand = "ASUS",
                    Specifications = "Intel Core Ultra 7 155H, 16GB LPDDR5X, 1TB SSD, 14\" 3K OLED 120Hz, Windows 11",
                    ImportPrice = 24000000, Price = 28990000, StockQuantity = 12, LowStockThreshold = 4, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"), // Ảnh laptop mỏng nhẹ văn phòng

                (new Product { ProductCode = "LAP-LENOVO-LEGION", Name = "Lenovo Legion Pro 5", Category = "Laptop", Brand = "Lenovo",
                    Specifications = "AMD Ryzen 7 7745HX, 16GB DDR5, 512GB SSD, RTX 4060 8GB, 16\" WQXGA 165Hz",
                    ImportPrice = 33000000, Price = 38490000, StockQuantity = 9, LowStockThreshold = 3, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80"), // Ảnh góc làm việc gaming / laptop Lenovo mở rộng

                (new Product { ProductCode = "LAP-LENOVO-X1", Name = "Lenovo ThinkPad X1 Carbon Gen 12", Category = "Laptop", Brand = "Lenovo",
                    Specifications = "Intel Core Ultra 7 155U, 32GB RAM, 1TB SSD, 14\" WUXGA IPS, vỏ sợi carbon",
                    ImportPrice = 40000000, Price = 46990000, StockQuantity = 4, LowStockThreshold = 2, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80"), // Ảnh laptop làm việc cao cấp đen nhám

                (new Product { ProductCode = "LAP-HP-SPECTRE", Name = "HP Spectre x360 14", Category = "Laptop", Brand = "HP",
                    Specifications = "Intel Core Ultra 7 155H, 16GB, 1TB SSD, 14\" 2.8K OLED Touch, xoay gập 360°",
                    ImportPrice = 30000000, Price = 35990000, StockQuantity = 6, LowStockThreshold = 3, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800&q=80"), // Ảnh laptop thiết kế thanh lịch sang trọng

                (new Product { ProductCode = "LAP-ACER-SWIFT", Name = "Acer Swift Go 14", Category = "Laptop", Brand = "Acer",
                    Specifications = "Intel Core i5-13500H, 16GB LPDDR5, 512GB SSD, 14\" 2.2K IPS, nhẹ 1.25kg",
                    ImportPrice = 16000000, Price = 19990000, StockQuantity = 18, LowStockThreshold = 5, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80"), // Ảnh công nghệ laptop màu bạc sáng

                (new Product { ProductCode = "LAP-MSI-KATANA", Name = "MSI Katana 15", Category = "Laptop", Brand = "MSI",
                    Specifications = "Intel Core i7-13620H, 16GB DDR5, 512GB SSD, RTX 4050 6GB, 15.6\" FHD 144Hz",
                    ImportPrice = 22000000, Price = 26490000, StockQuantity = 2, LowStockThreshold = 3, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=800&q=80"), // Ảnh cận cảnh màn hình laptop mạnh mẽ

                // === NHÓM CHUỘT & BÀN PHÍM ===
                (new Product { ProductCode = "ACC-LOGI-MXMASTER", Name = "Chuột Logitech MX Master 3S", Category = "Chuột không dây", Brand = "Logitech",
                    Specifications = "Cảm biến 8000 DPI, cuộn MagSpeed, kết nối Bluetooth/USB, pin 70 ngày",
                    ImportPrice = 1900000, Price = 2590000, StockQuantity = 40, LowStockThreshold = 10, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80"), // Ảnh chuột công thái học cao cấp

                (new Product { ProductCode = "ACC-KEY-KEYCHRON", Name = "Bàn phím cơ Keychron K8 Pro", Category = "Bàn phím không dây", Brand = "Keychron",
                    Specifications = "Layout TKL, switch Gateron, hot-swap, RGB, kết nối không dây Bluetooth 5.1",
                    ImportPrice = 2200000, Price = 2990000, StockQuantity = 25, LowStockThreshold = 8, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"), // Bàn phím cơ cơ học custom

                (new Product { ProductCode = "ACC-LOGI-G502", Name = "Chuột Logitech G502 HERO", Category = "Chuột có dây", Brand = "Logitech",
                    Specifications = "Cảm biến 16.000 DPI, thiết kế ergonomic, kết nối USB, đèn RGB, 11 nút có thể lập trình",
                    ImportPrice = 950000, Price = 1499000, StockQuantity = 30, LowStockThreshold = 8, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80"), // Ảnh chuột gaming hầm hố có dây

                (new Product { ProductCode = "ACC-ASUS-ROG-STRIX", Name = "Bàn phím ASUS ROG Strix Scope", Category = "Bàn phím có dây", Brand = "ASUS",
                    Specifications = "Bàn phím cơ full-size, switch ROG NX, đèn RGB, kết nối USB, kê tay đi kèm",
                    ImportPrice = 2200000, Price = 2890000, StockQuantity = 18, LowStockThreshold = 6, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"), // Ảnh bàn phím cơ gaming RGB rực rỡ

                (new Product { ProductCode = "ACC-LAP-STAND", Name = "Giá kê laptop Cooler Master", Category = "Giá kê laptop", Brand = "Cooler Master",
                    Specifications = "Giá kê laptop hợp kim nhôm, 6 mức điều chỉnh độ cao, tản nhiệt tốt, gấp gọn tiện lợi",
                    ImportPrice = 350000, Price = 450000, StockQuantity = 50, LowStockThreshold = 10, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&q=80"), // Phụ kiện setup/giá đỡ

                // === BỔ SUNG: MÀN HÌNH MÁY TÍNH ===
                (new Product { ProductCode = "MON-ASUS-TUF27", Name = "Màn hình ASUS TUF Gaming VG27AQ", Category = "Màn hình", Brand = "ASUS",
                    Specifications = "27 inch, IPS, 2K WQHD (2560x1440), 165Hz, 1ms, G-Sync tương thích, HDR10",
                    ImportPrice = 6500000, Price = 7990000, StockQuantity = 12, LowStockThreshold = 3, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"), // Ảnh màn hình máy tính bàn lớn

                (new Product { ProductCode = "MON-DELL-U2724D", Name = "Màn hình Dell UltraSharp U2724D", Category = "Màn hình", Brand = "Dell",
                    Specifications = "27 inch, IPS Black, 2K QHD, 120Hz, 100% sRGB, chuyên đồ họa chuyên nghiệp",
                    ImportPrice = 8200000, Price = 9890000, StockQuantity = 10, LowStockThreshold = 2, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80"), // Ảnh màn hình thiết kế mỏng đồ họa

                // === BỔ SUNG: TAI NGHE / PHẦN CỨNG LINH KIỆN ===
                (new Product { ProductCode = "ACC-HYPERX-CLOUD", Name = "Tai nghe HyperX Cloud III Wireless", Category = "Tai nghe", Brand = "HyperX",
                    Specifications = "Kết nối không dây 2.4GHz, âm thanh vòm DTS Headphone:X, pin trâu lên đến 120 giờ",
                    ImportPrice = 2700000, Price = 3490000, StockQuantity = 15, LowStockThreshold = 4, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"), // Ảnh tai nghe trùm đầu chụp tai

                (new Product { ProductCode = "COM-VGA-RTX4070", Name = "Card màn hình ASUS Dual RTX 4070 OC 12GB", Category = "Linh kiện", Brand = "ASUS",
                    Specifications = "NVIDIA GeForce RTX 4070, 12GB GDDR6X, DLSS 3, Ray Tracing, 2 quạt làm mát",
                    ImportPrice = 16000000, Price = 18490000, StockQuantity = 6, LowStockThreshold = 2, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80"), // Ảnh bo mạch/Card đồ họa VGA chuyên dụng

                (new Product { ProductCode = "COM-SSD-SAMSUNG", Name = "Ổ cứng SSD Samsung 990 Pro 1TB NVMe M.2", Category = "Linh kiện", Brand = "Samsung",
                    Specifications = "PCIe Gen4 x4, Tốc độ đọc 7450 MB/s, Ghi 6900 MB/s, bộ nhớ V-NAND bền bỉ",
                    ImportPrice = 2100000, Price = 2850000, StockQuantity = 35, LowStockThreshold = 5, CreatedAt = DateTime.UtcNow },
                    "https://images.unsplash.com/photo-1628546098751-a14c000c0f4f?w=800&q=80") // Ảnh ổ cứng SSD siêu tốc gắn trong
            };

                _context.Products.AddRange(products.Select(x => x.product));
                _context.SaveChanges();

                _context.ProductImages.AddRange(
                    products.Select(x => new ProductImage
                    {
                        ProductId = x.product.Id,
                        ImageUrl = x.image,
                        IsMain = true
                    })
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
                    },
                    new Voucher
                    {
                        Code = "SINHVIEN10",
                        Name = "Ưu đãi sinh viên - giảm 10%",
                        DiscountType = "Percentage",
                        DiscountValue = 10,
                        MinOrderValue = 15000000,
                        TotalUsageLimit = 200,
                        StartDate = DateTime.SpecifyKind(rawStartDate, DateTimeKind.Utc),
                        EndDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(60), DateTimeKind.Utc)
                    },
                    new Voucher
                    {
                        Code = "FREESHIP",
                        Name = "Miễn phí vận chuyển toàn quốc",
                        DiscountType = "FixedAmount",
                        DiscountValue = 300000,
                        MinOrderValue = 5000000,
                        TotalUsageLimit = 500,
                        StartDate = DateTime.SpecifyKind(rawStartDate, DateTimeKind.Utc),
                        EndDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(90), DateTimeKind.Utc)
                    },
                    new Voucher
                    {
                        Code = "BLACKFRIDAY",
                        Name = "Black Friday - giảm 5%",
                        DiscountType = "Percentage",
                        DiscountValue = 5,
                        MinOrderValue = 0,
                        TotalUsageLimit = 1000,
                        StartDate = DateTime.SpecifyKind(rawStartDate, DateTimeKind.Utc),
                        EndDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(15), DateTimeKind.Utc)
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

            // 7. GIEO DỮ LIỆU ĐÁNH GIÁ SẢN PHẨM MẪU (UC-15)
            if (!_context.ProductReviews.Any())
            {
                var firstCustomer = _context.Customers.FirstOrDefault();
                var someProducts = _context.Products.Take(2).ToList();

                if (firstCustomer != null && someProducts.Any())
                {
                    var sampleReviews = new List<ProductReview>();

                    foreach (var product in someProducts)
                    {
                        sampleReviews.Add(new ProductReview
                        {
                            Id = Guid.NewGuid(),
                            ProductId = product.Id,
                            CustomerId = firstCustomer.Id,
                            CustomerName = firstCustomer.FullName,
                            Rating = 5,
                            Title = "Sản phẩm rất tốt",
                            Content = "Máy chạy mượt, cấu hình mạnh, đóng gói cẩn thận. Rất hài lòng với trải nghiệm mua hàng.",
                            IsVerifiedPurchase = true,
                            IsHidden = false,
                            HelpfulCount = 3,
                            CreatedAt = DateTime.UtcNow.AddDays(-2)
                        });
                    }

                    _context.ProductReviews.AddRange(sampleReviews);
                    _context.SaveChanges();
                }
            }
        }

        // Đảm bảo các tài khoản mẫu luôn tồn tại và đăng nhập được với mật khẩu "Password@123".
        // Dùng chính trình xác thực mật khẩu để phát hiện hash hỏng (không chỉ riêng chuỗi giữ chỗ).
        private void EnsureSampleAccounts()
        {
            const string defaultPassword = "Password@123";
            var hasher = new PasswordHasher<User>();

            // Danh sách tài khoản mẫu: (username, họ tên, email, vai trò)
            var sampleAccounts = new (string Username, string FullName, string Email, string Role)[]
            {
                ("admin_01", "Nguyễn Văn Admin", "admin01@computerstore.local", "admin"),
                ("sales_01", "Trần Thị Bán Hàng", "sales01@computerstore.local", "sales"),
                ("acc_01", "Phạm Kế Toán", "accountant01@computerstore.local", "accountant"),
                ("kho_01", "Lê Thủ Kho", "warehouse01@computerstore.local", "warehouse"),
                ("longkhachhang", "Trần Hoàng Long", "longth@gmail.com", "customer"),
            };

            var changed = false;

            foreach (var acc in sampleAccounts)
            {
                var user = _context.Users.FirstOrDefault(u => u.Username == acc.Username);

                if (user == null)
                {
                    // Tài khoản chưa tồn tại -> tạo mới
                    user = new User
                    {
                        Id = Guid.NewGuid(),
                        Username = acc.Username,
                        FullName = acc.FullName,
                        Email = acc.Email,
                        RoleName = acc.Role,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        PasswordHash = string.Empty
                    };
                    user.PasswordHash = hasher.HashPassword(user, defaultPassword);
                    _context.Users.Add(user);
                    changed = true;
                }
                else
                {
                    // Tài khoản đã có -> kiểm tra mật khẩu hiện tại có hợp lệ không
                    var needsReset = false;
                    if (string.IsNullOrWhiteSpace(user.PasswordHash))
                    {
                        needsReset = true;
                    }
                    else
                    {
                        try
                        {
                            var verify = hasher.VerifyHashedPassword(user, user.PasswordHash, defaultPassword);
                            // Nếu hash không đúng định dạng hoặc không khớp mật khẩu mặc định -> đặt lại
                            needsReset = verify == PasswordVerificationResult.Failed;
                        }
                        catch
                        {
                            // Hash hỏng/không decode được -> đặt lại
                            needsReset = true;
                        }
                    }

                    if (needsReset)
                    {
                        user.PasswordHash = hasher.HashPassword(user, defaultPassword);
                        user.IsActive = true;
                        changed = true;
                    }
                }

                // Nếu là khách hàng, đảm bảo có bản ghi Customer tương ứng để mua hàng/đánh giá
                if (acc.Role == "customer")
                {
                    var customer = _context.Customers.FirstOrDefault(c => c.WebUsername == acc.Username);
                    if (customer == null)
                    {
                        _context.Customers.Add(new Customer
                        {
                            Id = Guid.NewGuid(),
                            FullName = acc.FullName,
                            PhoneNumber = "0912345678",
                            Email = acc.Email,
                            Address = "123 Nguyễn Huệ, Quận 1, TPHCM",
                            Notes = "Khách hàng mẫu online",
                            WebUsername = acc.Username,
                            WebPasswordHash = user.PasswordHash,
                            CreatedAt = DateTime.UtcNow
                        });
                        changed = true;
                    }
                }
            }

            if (changed)
            {
                _context.SaveChanges();
            }
        }
    }
}