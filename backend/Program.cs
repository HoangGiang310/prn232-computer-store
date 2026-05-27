using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ComputerStoreApi.Data;
using ComputerStoreApi.Models;
using ComputerStoreApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Computer Store API", Version = "v1" });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IJwtService, JwtService>();

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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("admin"));
    options.AddPolicy("Sales", policy => policy.RequireRole("sales"));
    options.AddPolicy("Accountant", policy => policy.RequireRole("accountant"));
    options.AddPolicy("Warehouse", policy => policy.RequireRole("warehouse"));
    options.AddPolicy("Customer", policy => policy.RequireRole("customer"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any())
    {
        var hasher = new PasswordHasher<User>();
        var defaultUsers = new List<User>
        {
            new User { Username = "admin", Email = "admin@computerstore.local", Role = "admin" },
            new User { Username = "sales", Email = "sales@computerstore.local", Role = "sales" },
            new User { Username = "accountant", Email = "accountant@computerstore.local", Role = "accountant" },
            new User { Username = "warehouse", Email = "warehouse@computerstore.local", Role = "warehouse" },
            new User { Username = "customer", Email = "customer@computerstore.local", Role = "customer" }
        };

        var passwords = new Dictionary<string, string>
        {
            { "admin", "Admin@123" },
            { "sales", "Sales@123" },
            { "accountant", "Accountant@123" },
            { "warehouse", "Warehouse@123" },
            { "customer", "Customer@123" }
        };

        foreach (var user in defaultUsers)
        {
            user.PasswordHash = hasher.HashPassword(user, passwords[user.Username]);
            db.Users.Add(user);
        }

        db.SaveChanges();
    }
}

app.Run();
