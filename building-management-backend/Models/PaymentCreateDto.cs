namespace BuildingManagement.Models
{
    public class PaymentCreateDto
    {
        public int ApartmentId { get; set; }
        public decimal Amount { get; set; }
        public bool Paid { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}