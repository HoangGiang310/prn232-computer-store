using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;
using ComputerStoreApi.Services;

const string databaseName = "computerstore";
var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. ĐĂNG KÝ CÁC SERVICES TRONG CONTAINER
// ==========================================
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Computer Store API", Version = "v1" });
});

// Cấu hình kết nối cơ sở dữ liệu PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký các Service xử lý Logic/Nghiệp vụ
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<DatabaseSeeder>(); // Đăng ký bộ gieo dữ liệu mẫu ở đây

// Cấu hình Authentication (JWT Token)
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Cấu hình Phân quyền Authorization dựa trên vai trò hệ thống
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("admin"));
    options.AddPolicy("Staff", policy => policy.RequireRole("sales", "warehouse", "accountant")); // Sửa theo các vai trò thực tế
    options.AddPolicy("Customer", policy => policy.RequireRole("customer"));
});

// ==========================================
// 2. BUILD ỨNG DỤNG & CẤU HÌNH PIPELINE
// ==========================================
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Kích hoạt Middleware xác thực quyền truy cập
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ==========================================
// 3. TỰ ĐỘNG KHỞI TẠO DATABASE & SEED DATA
// ==========================================
var defaultConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
var masterConnectionString = new NpgsqlConnectionStringBuilder(defaultConnectionString) { Database = "postgres" }.ConnectionString;

try
{
    // Bước A: Kiểm tra xem database "computerstore" đã tồn tại trên PostgreSQL chưa, nếu chưa thì tạo mới
    using (var masterConnection = new NpgsqlConnection(masterConnectionString))
    {
        masterConnection.Open();
        using var checkDb = new NpgsqlCommand("SELECT 1 FROM pg_database WHERE datname = @db", masterConnection);
        checkDb.Parameters.AddWithValue("db", databaseName);
        var exists = checkDb.ExecuteScalar() != null;
        if (!exists)
        {
            using var createDb = new NpgsqlCommand($"CREATE DATABASE \"{databaseName}\"", masterConnection);
            createDb.ExecuteNonQuery();
        }
    }

    // Bước B: Chạy hàm SeedAllData() từ DatabaseSeeder để gieo dữ liệu mẫu Laptop, Voucher, Đơn hàng...
    using (var scope = app.Services.CreateScope())
    {
        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        seeder.SeedAllData();
    }
}
catch (Exception ex)
{
    // Ghi log lỗi nếu quá trình khởi tạo DB hoặc gieo dữ liệu gặp trục trặc
    var logger = app.Services.CreateScope().ServiceProvider.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Đã xảy ra lỗi trong quá trình khởi tạo hoặc gieo dữ liệu Database.");
}

// ==========================================
// 4. KÍCH HOẠT ỨNG DỤNG CHẠY
// ==========================================
app.Run();