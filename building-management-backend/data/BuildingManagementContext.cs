using Microsoft.EntityFrameworkCore;
using BuildingManagement.Models; 

namespace BuildingManagement.Models
{
    public class BuildingManagementContext : DbContext
    {
        public BuildingManagementContext(DbContextOptions options) : base(options) { }

        public DbSet<Apartment> Apartments { get; set; }
        public DbSet<Payment> Payments { get; set; } 
    }
}
