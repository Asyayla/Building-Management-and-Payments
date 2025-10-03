using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace BuildingManagement.Models
{
    public class Apartment
    {
          [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
          public int Id { get; set; }
          public string Block { get; set; } = string.Empty;
          public int Floor { get; set; }
          public int Number { get; set; }
          public bool IsOccupied { get; set; }
    }
}