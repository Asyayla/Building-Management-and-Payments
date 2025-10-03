using Microsoft.EntityFrameworkCore;
using BuildingManagement.Models; // Payment modelimizi kullanabilmek için ekleyelim

namespace BuildingManagement.Models
{
    public class BuildingManagementContext : DbContext
    {
        public BuildingManagementContext(DbContextOptions options) : base(options) { }

        public DbSet<Apartment> Apartments { get; set; }
        public DbSet<Payment> Payments { get; set; } // <- Payments tablosu eklendi
    }
}