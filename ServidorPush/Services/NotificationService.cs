using Org.BouncyCastle.Asn1.Mozilla;
using WebPush;

namespace ServidorPush.Services
{
    public class NotificationService
    {
        WebPushClient pushClient = new();
        VapidDetails vapid;

        public NotificationService(IConfiguration configuration)
        {
            vapid = new()
            {
                Subject = configuration["Vapid:subject"],
                PrivateKey = configuration["Vapid:privateKey"],
                PublicKey = configuration["Vapid:publicKey"]
            };
        }

        public async void EnviarNotificacion(PushSubscription cliente, string mensaje)
        {
            await pushClient.SendNotificationAsync(cliente, mensaje, vapid);
        }
    }
}
