using Microsoft.EntityFrameworkCore;
using WealthWise.API.Models.Domain;

namespace WealthWise.API.Data
{
    public class WealthWiseDbContext : DbContext
    {
        public WealthWiseDbContext(DbContextOptions<WealthWiseDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Portfolio> Portfolios => Set<Portfolio>();
        public DbSet<Asset> Assets => Set<Asset>();
        public DbSet<Stock> Stocks => Set<Stock>();
        public DbSet<Bond> Bonds => Set<Bond>();
        public DbSet<MutualFund> MutualFunds => Set<MutualFund>();
        public DbSet<ETF> ETFs => Set<ETF>();
        public DbSet<Investment> Investments => Set<Investment>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();
        public DbSet<FinancialGoal> FinancialGoals => Set<FinancialGoal>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table per hierarchy (TPH) for Asset polymorphic inheritance
            modelBuilder.Entity<Asset>()
                .HasDiscriminator<string>("AssetType")
                .HasValue<Stock>("Stock")
                .HasValue<Bond>("Bond")
                .HasValue<MutualFund>("MutualFund")
                .HasValue<ETF>("ETF");

            // Decimal Precision configuration for financial accuracy (18, 2)
            foreach (var property in modelBuilder.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetPrecision(18);
                property.SetScale(2);
            }

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            });

            // Portfolio configuration
            modelBuilder.Entity<Portfolio>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Portfolios)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Investment configuration
            modelBuilder.Entity<Investment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Ticker).IsRequired().HasMaxLength(20);
                entity.HasOne(e => e.Portfolio)
                    .WithMany(p => p.Investments)
                    .HasForeignKey(e => e.PortfolioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Transaction configuration
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionType).IsRequired().HasMaxLength(20);
                entity.HasOne(e => e.Portfolio)
                    .WithMany(p => p.Transactions)
                    .HasForeignKey(e => e.PortfolioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // WatchlistItem configuration
            modelBuilder.Entity<WatchlistItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                    .WithMany(u => u.WatchlistItems)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // FinancialGoal configuration
            modelBuilder.Entity<FinancialGoal>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                    .WithMany(u => u.FinancialGoals)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
