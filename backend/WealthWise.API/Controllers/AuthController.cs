using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Common;
using WealthWise.API.Services;

namespace WealthWise.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out int id))
            {
                return id;
            }
            return 1; // Default demo user fallback for seamless development
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Invalid credentials format."));

            var result = await _authService.AuthenticateAsync(request);
            if (result == null)
                return Unauthorized(ApiResponse<string>.Fail("Invalid email or password."));

            return Ok(ApiResponse<AuthResponse>.Ok(result, "Login successful."));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Invalid registration data."));

            var result = await _authService.RegisterAsync(request);
            return Ok(ApiResponse<AuthResponse>.Ok(result, "Account registered successfully."));
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            int userId = GetCurrentUserId();
            var profile = await _authService.GetUserProfileAsync(userId);
            if (profile == null)
                return NotFound(ApiResponse<string>.Fail("User profile not found."));

            return Ok(ApiResponse<UserProfileDto>.Ok(profile));
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            int userId = GetCurrentUserId();
            var updated = await _authService.UpdateUserProfileAsync(userId, dto);
            if (updated == null)
                return NotFound(ApiResponse<string>.Fail("User not found."));

            return Ok(ApiResponse<UserProfileDto>.Ok(updated, "Profile updated successfully."));
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            int userId = GetCurrentUserId();
            bool success = await _authService.ChangePasswordAsync(userId, dto);
            if (!success)
                return BadRequest(ApiResponse<string>.Fail("Incorrect current password."));

            return Ok(ApiResponse<string>.Ok("Password changed successfully."));
        }
    }
}
