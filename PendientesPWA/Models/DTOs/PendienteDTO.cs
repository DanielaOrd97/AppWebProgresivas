namespace PendientesPWA.Models.DTOs
{
    public class PendienteDTO
    {
        public int? Id { get; set; }
        public string Descripcion { get; set; } = null!;
        public int? Estado { get; set; }
    }
}
