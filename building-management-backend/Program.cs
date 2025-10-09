using BuildingManagement.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace BuildingManagement;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.UseUrls("http://*:5287");

        // Add services to the container.
        builder.Services.AddAuthorization();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddControllers();
        builder.Services.AddMemoryCache();
        builder.Services.AddHttpClient();

        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
            {
                Title = "BuildingManagementAPI",
                Version = "v1"
            });
        });

        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = builder.Configuration.GetConnectionString("Redis");
        });

        // SQLite database
        builder.Services.AddDbContext<BuildingManagementContext>(options => 
            options.UseSqlite("Data Source=BuildingManagement.db"));

        builder.Services.AddHealthChecks();

        //  CORS policy: frontend port 3000
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowVite",
                p => p.WithOrigins("http://localhost:3001")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials());
        });

        var app = builder.Build();

        // HTTP request pipeline configuration
        if(app.Environment.IsDevelopment())
        {
            app.UseSwagger(options => options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi2_0);
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "BuildingManagementAPI v1");
            });
        }


        //  CORS middleware
        app.UseCors("AllowVite");

        app.UseAuthorization();
        app.MapControllers();

        app.UseWebSockets();
        app.Map("/ws/apartments/updates", async context =>
        {
            if(context.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                WebSocketHandler.AddSocket(webSocket);
                await WebSocketHandler.Receive(webSocket);
            }
            else
            {
                context.Response.StatusCode = 400;
            }
        });

        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<BuildingManagementContext>();
            context.Database.Migrate();

            if(!context.Apartments.Any())
            {
                context.Apartments.AddRange(
                    new Apartment 
                    { 
                        Block = "A",
                        Floor = 3, 
                        Number = 12,
                        IsOccupied = true 
                    }
                );

                context.SaveChanges();
            }
        }

        app.MapHealthChecks("/health");
        app.Run("http://127.0.0.1:5287");
    }

}
