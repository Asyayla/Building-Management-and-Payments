using Microsoft.AspNetCore.Mvc;
using BuildingManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace BuildingManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApartmentsController : ControllerBase
    {
        private readonly BuildingManagementContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public ApartmentsController(BuildingManagementContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        private ApartmentDTO ToDto(Apartment apartment)
        {
            return new ApartmentDTO
            {
                Id = apartment.Id,
                Block = apartment.Block,
                Floor = apartment.Floor,
                Number = apartment.Number,
                IsOccupied = apartment.IsOccupied
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetApartments()
        {
            var apartments = await _context.Apartments.ToListAsync();
            return Ok(apartments.Select(a => ToDto(a)));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetApartmentById(int id)
        {
            var apartment = await _context.Apartments.FindAsync(id);
            if (apartment == null) return NotFound();
            return Ok(ToDto(apartment));
        }

        [HttpPost]
        public async Task<IActionResult> CreateApartment([FromBody] ApartmentCreateDTO dto)
        {
            var apartment = new Apartment
            {
                Block = dto.Block,
                Floor = dto.Floor,
                Number = dto.Number,
                IsOccupied = dto.IsOccupied
            };

            _context.Apartments.Add(apartment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApartmentById), new { id = apartment.Id }, ToDto(apartment));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateApartment(int id, [FromBody] ApartmentUpdateDTO dto)
        {
            var apartment = await _context.Apartments.FindAsync(id);
            if (apartment == null) return NotFound();

            apartment.Block = dto.Block;
            apartment.Floor = dto.Floor;
            apartment.Number = dto.Number;
            apartment.IsOccupied = dto.IsOccupied;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApartment(int id)
        {
            var apartment = await _context.Apartments.FindAsync(id);
            if (apartment == null) return NotFound();

            _context.Apartments.Remove(apartment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("import-random")]
        public async Task<IActionResult> ImportRandomApartment()
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync("https://randomuser.me/api/");
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "API call failed");

            var content = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(content);

            var random = new Random();
            var apartment = new Apartment
            {
                Block = ((char)('A' + random.Next(0, 5))).ToString(),
                Floor = random.Next(1, 11),
                Number = random.Next(1, 51),
                IsOccupied = random.Next(0, 2) == 1
            };

            _context.Apartments.Add(apartment);
            await _context.SaveChangesAsync();

            return Ok(ToDto(apartment));
        }

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok("Apartments service is healthy");
        }
    }
}
