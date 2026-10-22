using System;

namespace WealthWise.API.DTOs
{
    public class CreateGoalDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public decimal TargetAmount { get; set; }
        public decimal CurrentSavings { get; set; }
        public DateTime TargetDate { get; set; }
    }

    public class UpdateGoalDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public decimal TargetAmount { get; set; }
        public decimal CurrentSavings { get; set; }
        public DateTime TargetDate { get; set; }
    }

    public class GoalDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public decimal CurrentSavings { get; set; }
        public decimal RemainingAmount { get; set; }
        public decimal ProgressPercentage { get; set; }
        public decimal EstimatedMonthlySavings { get; set; }
        public DateTime TargetDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
