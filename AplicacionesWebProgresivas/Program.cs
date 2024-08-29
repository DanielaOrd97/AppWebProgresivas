var builder = WebApplication.CreateBuilder(args);


var app = builder.Build();


app.UseStaticFiles();  //solo este es necesario

app.Run();
