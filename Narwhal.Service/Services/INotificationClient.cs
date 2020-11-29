using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Narwhal.Service.Services
{
    public interface INotificationClient
    {
        [HubMethodName("onNavwarningsUpdate")]
        public Task OnNavwarningsUpdate();
        
        [HubMethodName("onTrackingUpdate")]
        public Task OnTrackingUpdate();
    }
}