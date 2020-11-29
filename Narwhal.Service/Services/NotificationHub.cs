using Microsoft.AspNetCore.SignalR;

namespace Narwhal.Service.Services
{
    public class NotificationHub : Hub<INotificationClient>
    {
    }
}