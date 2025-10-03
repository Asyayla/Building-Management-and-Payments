namespace BuildingManagement.Models
{
    public class ApartmentUpdateDTO
    {
        public string Block { get; set; } = "";
        public int Floor { get; set; }
        public int Number { get; set; }
        public bool IsOccupied { get; set; }
    }
}
