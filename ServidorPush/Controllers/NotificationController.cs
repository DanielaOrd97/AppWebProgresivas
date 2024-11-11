using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ServidorPush.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        [HttpPost]
        public IActionResult Suscribir()
        {
            return Ok();
        }

        [HttpGet("/enviar/{mensaje}")]
        public IActionResult EnviarNotificacion(string mensaje)
        {
            return Ok();
        }
    }
}
