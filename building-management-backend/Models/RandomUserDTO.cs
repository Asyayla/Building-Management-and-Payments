using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Components.Routing;

public class RandomUserDTO
{
    public string Gender { get; set; } = string.Empty;
    public Name name { get; set; } = new Name();
    public Location location { get; set; } = new Location();
    public string Email { get; set; } = string.Empty;

    public class Name
    {
        public string Title { get; set; } = string.Empty;
        public string First { get; set; } = string.Empty;
        public string Last { get; set; } = string.Empty;

    }

    public class Location
    {
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }
}