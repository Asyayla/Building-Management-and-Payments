using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildingManagement.Models;

namespace BuildingManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly BuildingManagementContext _context;

        public PaymentsController(BuildingManagementContext context)
        {
            _context = context;
        }

        // GET: api/payments
        [HttpGet]
        public async Task<IActionResult> GetPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Apartment)
                .Select(p => new
                {
                    p.Id,
                    Apartment = p.Apartment.Block + "-" + p.Apartment.Number,
                    ApartmentId = p.ApartmentId,
                    p.Amount,
                    p.Paid,
                    CreatedAt = p.CreatedAt.ToString("o") // ISO 8601 format
                })
                .ToListAsync();

            return Ok(payments);
        }


        // GET: api/payments/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Apartment)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null) return NotFound();

            return Ok(new
            {
                payment.Id,
                Apartment = payment.Apartment.Block + "-" + payment.Apartment.Number,
                payment.ApartmentId,
                payment.Amount,
                payment.Paid,
                CreatedAt = payment.CreatedAt.ToString("o")  // ISO 8601
            });
        }

        // POST: api/payments
        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var payment = new Payment
            {
                ApartmentId = dto.ApartmentId,
                Amount = dto.Amount,
                Paid = dto.Paid,
                CreatedAt = dto.CreatedAt == default ? DateTime.Now : dto.CreatedAt
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            var createdPayment = await _context.Payments
                .Include(p => p.Apartment)
                .FirstOrDefaultAsync(p => p.Id == payment.Id);

            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, new
            {
                createdPayment.Id,
                Apartment = createdPayment.Apartment.Block + "-" + createdPayment.Apartment.Number,
                createdPayment.ApartmentId,
                createdPayment.Amount,
                createdPayment.Paid,
                CreatedAt = createdPayment.CreatedAt.ToString("o")
            });
        }

        // PUT: api/payments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] PaymentCreateDto dto)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();

            payment.ApartmentId = dto.ApartmentId;
            payment.Amount = dto.Amount;
            payment.Paid = dto.Paid;

            await _context.SaveChangesAsync();

            var updatedPayment = await _context.Payments
                .Include(p => p.Apartment)
                .FirstOrDefaultAsync(p => p.Id == id);

            return Ok(new
            {
                updatedPayment.Id,
                Apartment = updatedPayment.Apartment.Block + "-" + updatedPayment.Apartment.Number,
                updatedPayment.ApartmentId,
                updatedPayment.Amount,
                updatedPayment.Paid,
                CreatedAt = updatedPayment.CreatedAt.ToString("o")
            });
        }

        // DELETE: api/payments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
