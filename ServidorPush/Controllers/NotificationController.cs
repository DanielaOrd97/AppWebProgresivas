using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServidorPush.Models;
using ServidorPush.Services;
using WebPush;

namespace ServidorPush.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        public NotificationController(NotificationService notificationService)
        {
                this.notificationService = notificationService;
        }

        private static List<PushSubscription> listaSuscriptores = new();
        private readonly NotificationService notificationService;

        [HttpPost]
        public IActionResult Suscribir(ClienteDTO cliente)
        {
            PushSubscription pushSubscription = new PushSubscription()
            {
                Endpoint = cliente.EndPoint,
                P256DH = cliente.Keys.P256dh,
                Auth = cliente.Keys.Auth
            };

            listaSuscriptores.Add(pushSubscription);    

            return Ok();
        }

        [HttpGet("/enviar/{mensaje}")]
        public async Task<IActionResult>EnviarNotificacion(string mensaje)
        {

            foreach (var item in listaSuscriptores.ToList())
            {
                await notificationService.EnviarNotificacion(item, mensaje);
            }


            return Ok();
        }
    }
}
