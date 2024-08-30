using System;
using System.Collections.Generic;

namespace PendientesPWA.Models;

public partial class Pendiente
{
    public int Id { get; set; }

    public string? Descripcion { get; set; }

    public int? Estado { get; set; }
}
