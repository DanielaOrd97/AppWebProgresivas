using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PendientesPWA.Models;
using PendientesPWA.Models.DTOs;
using PendientesPWA.Services;

namespace PendientesPWA.Controllers
{

    //PREGUNTA DE ENTREVISTA: PRINCIPIOS SOLID

    [Route("api/[controller]")]
    [ApiController]
    public class PendientesController : ControllerBase
    {
        public PendientesController(PendientesContext context, IHubContext<PendientesHub> hubContext)
        {
            Context = context;
            HubContext = hubContext;
        }

        public PendientesContext Context { get; }
        public IHubContext<PendientesHub> HubContext { get; }

        [HttpPost]
        public async Task<IActionResult> Post(PendienteDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Descripcion))
            {
                return BadRequest();
            }

            Pendiente p = new Pendiente()
            {
                Id = 0,
                Descripcion = dto.Descripcion,
                Estado = 0
            };

            Context.Add(p);
            Context.SaveChanges();

            //Informar con SignarR.
            await HubContext.Clients.All.SendAsync("NuevoPendiente", p); //se envia a todos incluido yo debido a la base de datos local y la que esta en linea. Por el autoincrementable, deben estar iguales los datos.


            return Ok();
        }

        [HttpGet]
        public IActionResult Get()
        {
            var datos = Context.Pendiente;
            return Ok(datos.Select(x => new
            {
                x.Id,
                x.Descripcion,
                x.Estado
            }));
        }

        [HttpPut("editarDescripcion")]
        public async Task<IActionResult> EditarDescripcion(PendienteDTO dto)
        {
            var pendiente = Context.Pendiente.Find(dto.Id);

            if(pendiente == null)
            {
                return NotFound();
            }

            pendiente.Descripcion = dto.Descripcion;
            Context.Update(pendiente);
            int total = Context.SaveChanges(); //Porque EntityFramework se asegura que el dato anterior y el nuevo no se repitan. Si se repiten, no hay cambios.

            //Notificar con signalr en caso de haber cambios.
            if(total > 0)
            {
                await HubContext.Clients.All.SendAsync("PendienteEditado", new
                {
                    pendiente.Id,
                    pendiente.Descripcion
                });
            }

            return Ok();
        }

        [HttpPut("editarEstado")]
        public IActionResult EditarEstado(PendienteDTO dto)
        {
            return Ok();
        }
    }
}
