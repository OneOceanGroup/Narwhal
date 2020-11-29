using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Narwhal.Service.Services
{
    public class NotificationService
    {
        private readonly IHubContext<NotificationHub, INotificationClient> _notificationHubContext;
        private readonly MessagingService _messagingService;
        
        public NotificationService(IHubContext<NotificationHub, INotificationClient> notificationHubContext, MessagingService messagingService)
        {
            _notificationHubContext = notificationHubContext;
            _messagingService = messagingService;
        }

        public async Task Initialize()
        {
            NotifySignalrHubFromMqttNavWarningsUpdates();
            NotifySignalrHubFromMqttTrackingUpdates();
        }

        private async Task NotifySignalrHubFromMqttTrackingUpdates()
        {
            var trackingUpdates = await _messagingService.Subscribe("narwhal/tracking/update");

            await foreach (var update in trackingUpdates)
            {
                await _notificationHubContext.Clients.All.OnTrackingUpdate();
            }
        }

        private async Task NotifySignalrHubFromMqttNavWarningsUpdates()
        {
            var navwarningsUpdates = await _messagingService.Subscribe("narwhal/navwarnings/update");

            await foreach (var update in navwarningsUpdates)
            {
                await _notificationHubContext.Clients.All.OnNavwarningsUpdate();
            }
        }
    }
}