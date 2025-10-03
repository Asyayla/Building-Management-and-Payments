using System.ComponentModel.DataAnnotations;

namespace BuildingManagement.Models
{
    public class ApartmentCreateDTO
    {
          [Required]
          public string Block { get; set; } = string.Empty;

          public int Floor { get; set; }

          public int Number { get; set; }

          public bool IsOccupied { get; set; }
    }
}