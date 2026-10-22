using System;

namespace WealthWise.API.DTOs
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int PortfolioId { get; set; }
        public string PreferredCurrency { get; set; } = "INR";
        public string ThemePreference { get; set; } = "light";
    }

    public class UserProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PreferredCurrency { get; set; } = "INR";
        public string ThemePreference { get; set; } = "light";
        public string DateFormat { get; set; } = "DD/MM/YYYY";
        public bool EmailNotifications { get; set; } = true;
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string PreferredCurrency { get; set; } = "INR";
        public string ThemePreference { get; set; } = "light";
        public string DateFormat { get; set; } = "DD/MM/YYYY";
        public bool EmailNotifications { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
