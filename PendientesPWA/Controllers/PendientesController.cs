using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PendientesPWA.Models;
using PendientesPWA.Models.DTOs;

namespace PendientesPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PendientesController : ControllerBase
    {
        public PendientesController(PendientesContext context)
        {
            Context = context;
        }

        public PendientesContext Context { get; }

        [HttpPost]
        public IActionResult Post(PendienteDTO dto)
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

            return Ok();
        }
    }
}
