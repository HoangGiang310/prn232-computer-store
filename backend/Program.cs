using System.Text;
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
    options.AddPolicy("Staff", policy => policy.RequireRole("staff"));
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

var defaultConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
var masterConnectionString = new NpgsqlConnectionStringBuilder(defaultConnectionString) { Database = "postgres" }.ConnectionString;
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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    var hasher = new PasswordHasher<User>();
    var defaultUsers = new Dictionary<string, (string Email, string Role, string Password)>
    {
        ["admin"] = ("admin@computerstore.local", "admin", "Admin@123"),
        ["staff"] = ("staff@computerstore.local", "staff", "Staff@123"),
        ["customer"] = ("customer@computerstore.local", "customer", "Customer@123")
    };

    foreach (var (username, data) in defaultUsers)
    {
        if (!db.Users.Any(u => u.Username == username))
        {
            var user = new User
            {
                Username = username,
                Email = data.Email,
                Role = data.Role
            };
            user.PasswordHash = hasher.HashPassword(user, data.Password);
            db.Users.Add(user);
        }
    }

    if (db.ChangeTracker.HasChanges())
    {
        db.SaveChanges();
    }
}

app.Run();
