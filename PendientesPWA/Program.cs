using Microsoft.EntityFrameworkCore;
using PendientesPWA.Models;
using PendientesPWA.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();  //vistas de razor sin controladores....

//Add signalr
builder.Services.AddSignalR();

// Add services to the container.

builder.Services.AddControllers(); //para la api
//context de db.
builder.Services.AddDbContext<PendientesContext>(x => x.UseMySql("server=localhost;user=root;password=root;database=Pendientes", Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.28-mysql")));

var app = builder.Build();

app.UseStaticFiles(); //para el front de la pwa
app.MapHub<PendientesHub>("/hub");
app.MapRazorPages();


app.Run();

//tabla pendientes:
/*
 id:auto
descripcion:varchar,
estado:int
 */