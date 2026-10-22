using System.Collections.Generic;
using System.Threading.Tasks;
using WealthWise.API.DTOs;

namespace WealthWise.API.Services
{
    public interface IGoalService
    {
        Task<List<GoalDetailDto>> GetGoalsAsync(int userId);
        Task<GoalDetailDto?> GetGoalByIdAsync(int userId, int goalId);
        Task<GoalDetailDto> CreateGoalAsync(int userId, CreateGoalDto dto);
        Task<GoalDetailDto?> UpdateGoalAsync(int userId, int goalId, UpdateGoalDto dto);
        Task<bool> DeleteGoalAsync(int userId, int goalId);
    }
}
