using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WealthWise.API.Data;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Domain;

namespace WealthWise.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly WealthWiseDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(WealthWiseDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password + "_wealthwise_salt");
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private static bool VerifyPassword(string password, string storedHash)
        {
            return HashPassword(password) == storedHash;
        }

        private string GenerateJwtToken(User user)
        {
            var key = _configuration["Jwt:Key"] ?? "WealthWise_Super_Secret_Key_For_Jwt_Token_Signing_2026";
            var issuer = _configuration["Jwt:Issuer"] ?? "WealthWise.API";
            var audience = _configuration["Jwt:Audience"] ?? "WealthWise.Client";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<AuthResponse?> AuthenticateAsync(LoginRequest request)
        {
            var user = await _context.Users
                .Include(u => u.Portfolios)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return null;
            }

            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var portfolio = user.Portfolios.FirstOrDefault();
            return new AuthResponse
            {
                Token = GenerateJwtToken(user),
                FullName = user.FullName,
                Email = user.Email,
                UserId = user.Id,
                PortfolioId = portfolio?.Id ?? 1,
                PreferredCurrency = user.PreferredCurrency,
                ThemePreference = user.ThemePreference
            };
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("Email and password are required.");
            }

            var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
            if (existing)
            {
                throw new InvalidOperationException("An account with this email already exists.");
            }

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLower(),
                PasswordHash = HashPassword(request.Password),
                Role = "Investor",
                PreferredCurrency = "INR",
                ThemePreference = "light",
                DateFormat = "DD/MM/YYYY",
                EmailNotifications = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create initial portfolio with starting cash
            var portfolio = new Portfolio
            {
                UserId = user.Id,
                Name = $"{user.FullName}'s Portfolio",
                CashBalance = 50000m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Portfolios.Add(portfolio);
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Token = GenerateJwtToken(user),
                FullName = user.FullName,
                Email = user.Email,
                UserId = user.Id,
                PortfolioId = portfolio.Id,
                PreferredCurrency = user.PreferredCurrency,
                ThemePreference = user.ThemePreference
            };
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PreferredCurrency = user.PreferredCurrency,
                ThemePreference = user.ThemePreference,
                DateFormat = user.DateFormat,
                EmailNotifications = user.EmailNotifications,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<UserProfileDto?> UpdateUserProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(dto.PreferredCurrency)) user.PreferredCurrency = dto.PreferredCurrency;
            if (!string.IsNullOrWhiteSpace(dto.ThemePreference)) user.ThemePreference = dto.ThemePreference;
            if (!string.IsNullOrWhiteSpace(dto.DateFormat)) user.DateFormat = dto.DateFormat;
            user.EmailNotifications = dto.EmailNotifications;

            await _context.SaveChangesAsync();
            return await GetUserProfileAsync(userId);
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
