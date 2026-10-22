using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WealthWise.API.Data;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Domain;

namespace WealthWise.API.Services
{
    public class GoalService : IGoalService
    {
        private readonly WealthWiseDbContext _context;

        public GoalService(WealthWiseDbContext context)
        {
            _context = context;
        }

        public async Task<List<GoalDetailDto>> GetGoalsAsync(int userId)
        {
            var goals = await _context.FinancialGoals
                .Where(g => g.UserId == userId)
                .OrderBy(g => g.TargetDate)
                .ToListAsync();

            return goals.Select(g => new GoalDetailDto
            {
                Id = g.Id,
                UserId = g.UserId,
                Title = g.Title,
                Category = g.Category,
                TargetAmount = g.TargetAmount,
                CurrentSavings = g.CurrentSavings,
                RemainingAmount = g.RemainingAmount,
                ProgressPercentage = g.ProgressPercentage,
                EstimatedMonthlySavings = g.CalculateEstimatedMonthlySavings(),
                TargetDate = g.TargetDate,
                CreatedAt = g.CreatedAt
            }).ToList();
        }

        public async Task<GoalDetailDto?> GetGoalByIdAsync(int userId, int goalId)
        {
            var g = await _context.FinancialGoals.FirstOrDefaultAsync(x => x.Id == goalId && x.UserId == userId);
            if (g == null) return null;

            return new GoalDetailDto
            {
                Id = g.Id,
                UserId = g.UserId,
                Title = g.Title,
                Category = g.Category,
                TargetAmount = g.TargetAmount,
                CurrentSavings = g.CurrentSavings,
                RemainingAmount = g.RemainingAmount,
                ProgressPercentage = g.ProgressPercentage,
                EstimatedMonthlySavings = g.CalculateEstimatedMonthlySavings(),
                TargetDate = g.TargetDate,
                CreatedAt = g.CreatedAt
            };
        }

        public async Task<GoalDetailDto> CreateGoalAsync(int userId, CreateGoalDto dto)
        {
            if (dto.TargetAmount <= 0) throw new ArgumentException("Target amount must be greater than zero.");

            var goal = new FinancialGoal
            {
                UserId = userId,
                Title = dto.Title.Trim(),
                Category = dto.Category,
                TargetAmount = dto.TargetAmount,
                CurrentSavings = Math.Max(0m, dto.CurrentSavings),
                TargetDate = dto.TargetDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.FinancialGoals.Add(goal);
            await _context.SaveChangesAsync();

            return (await GetGoalByIdAsync(userId, goal.Id))!;
        }

        public async Task<GoalDetailDto?> UpdateGoalAsync(int userId, int goalId, UpdateGoalDto dto)
        {
            var goal = await _context.FinancialGoals.FirstOrDefaultAsync(x => x.Id == goalId && x.UserId == userId);
            if (goal == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Title)) goal.Title = dto.Title.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Category)) goal.Category = dto.Category;
            if (dto.TargetAmount > 0) goal.TargetAmount = dto.TargetAmount;
            if (dto.CurrentSavings >= 0) goal.CurrentSavings = dto.CurrentSavings;
            if (dto.TargetDate > DateTime.MinValue) goal.TargetDate = dto.TargetDate;

            goal.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetGoalByIdAsync(userId, goalId);
        }

        public async Task<bool> DeleteGoalAsync(int userId, int goalId)
        {
            var goal = await _context.FinancialGoals.FirstOrDefaultAsync(x => x.Id == goalId && x.UserId == userId);
            if (goal == null) return false;

            _context.FinancialGoals.Remove(goal);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
