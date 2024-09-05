using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PendientesPWA.Models;
using PendientesPWA.Models.DTOs;
using PendientesPWA.Services;

namespace PendientesPWA.Controllers
{

    //PREGUNTA DE ENTREVISTA: PRINCIPIOS SOLID

    /*
     1. SRP: Single Responsability Principle: (Repository, service, validators)
     2. Open/Close Principle: Abierto para funcionalidades nuevas, cerrado para las que ya estan hechas. Para evitar errores y poder revertir.
     3. Liskov Sustitution Principle: Cualquier clase deberia ser sustituida por otra y seguir funcionando (Herencia, polimorfismo).
     4. Interface Segreggation Principle: Separar y definir que es lo que se requiere y de ahi se crear el objeto. (Herencia)
     5. Dependency Inversion Principle: Inyeccion de dependencias.
     */

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
        public async Task<IActionResult> EditarEstado(PendienteDTO dto)
        {
            if(dto.Estado == null)
            {
                return BadRequest("Debe especificar el estado.");
            }

            var pendiente = Context.Pendiente.Find(dto.Id);

            if (pendiente == null)
            {
                return NotFound();
            }

            pendiente.Estado = dto.Estado;
            Context.Update(pendiente);
            int total = Context.SaveChanges(); //Porque EntityFramework se asegura que el dato anterior y el nuevo no se repitan. Si se repiten, no hay cambios.

            //Notificar con signalr en caso de haber cambios.
            if (total > 0)
            {
                await HubContext.Clients.All.SendAsync("PendienteEditado", new
                {
                    pendiente.Id,
                    pendiente.Estado
                });
            }

            return Ok();
        }

        [HttpDelete]
        public async  Task<IActionResult> Delete(int id)
        {
            var pendiente = Context.Pendiente.Find(id);

            if (pendiente == null)
            {
                return NotFound();
            }

            Context.Remove(pendiente);
            Context.SaveChanges();

            //Notificar eliminacion.
            await HubContext.Clients.All.SendAsync("PendienteEliminado", pendiente.Id);

            return Ok();
        }

        //Extension conveyor para probar api sin doimnio.
    }
}
