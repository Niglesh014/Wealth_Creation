using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Common;
using WealthWise.API.Services;

namespace WealthWise.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoalsController : ControllerBase
    {
        private readonly IGoalService _goalService;

        public GoalsController(IGoalService goalService)
        {
            _goalService = goalService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out int id))
            {
                return id;
            }
            return 1;
        }

        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            int userId = GetCurrentUserId();
            var list = await _goalService.GetGoalsAsync(userId);
            return Ok(ApiResponse<List<GoalDetailDto>>.Ok(list));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetGoalById(int id)
        {
            int userId = GetCurrentUserId();
            var goal = await _goalService.GetGoalByIdAsync(userId, id);
            if (goal == null)
                return NotFound(ApiResponse<string>.Fail("Financial goal not found."));

            return Ok(ApiResponse<GoalDetailDto>.Ok(goal));
        }

        [HttpPost]
        public async Task<IActionResult> CreateGoal([FromBody] CreateGoalDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title) || dto.TargetAmount <= 0)
                return BadRequest(ApiResponse<string>.Fail("Title and positive target amount are required."));

            int userId = GetCurrentUserId();
            var created = await _goalService.CreateGoalAsync(userId, dto);
            return CreatedAtAction(nameof(GetGoalById), new { id = created.Id }, ApiResponse<GoalDetailDto>.Ok(created, "Financial goal created successfully."));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateGoal(int id, [FromBody] UpdateGoalDto dto)
        {
            int userId = GetCurrentUserId();
            var updated = await _goalService.UpdateGoalAsync(userId, id, dto);
            if (updated == null)
                return NotFound(ApiResponse<string>.Fail("Financial goal not found."));

            return Ok(ApiResponse<GoalDetailDto>.Ok(updated, "Financial goal updated successfully."));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            int userId = GetCurrentUserId();
            bool deleted = await _goalService.DeleteGoalAsync(userId, id);
            if (!deleted)
                return NotFound(ApiResponse<string>.Fail("Financial goal not found."));

            return Ok(ApiResponse<string>.Ok("Financial goal deleted successfully."));
        }
    }
}
