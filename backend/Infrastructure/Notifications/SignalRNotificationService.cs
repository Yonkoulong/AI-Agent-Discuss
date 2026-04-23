using backend.Api.Hubs;
using backend.Application.DTOs;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace backend.Infrastructure.Notifications;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<ChatHub> _hub;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(IHubContext<ChatHub> hub, ILogger<SignalRNotificationService> logger)
    {
        _hub = hub;
        _logger = logger;
    }

    public Task NotifyNewComment(string postOwnerId, NotificationPayload payload)
    {
        if (postOwnerId == payload.FromUserId) return Task.CompletedTask;
        _logger.LogInformation("Notify {Owner}: {@Payload}", postOwnerId, payload);
        return _hub.Clients.User(postOwnerId).SendAsync("ReceiveNotification", payload);
    }

    public Task NotifyReply(string commentOwnerId, NotificationPayload payload)
    {
        if (commentOwnerId == payload.FromUserId) return Task.CompletedTask;
        _logger.LogInformation("Notify {Owner}: {@Payload}", commentOwnerId, payload);
        return _hub.Clients.User(commentOwnerId).SendAsync("ReceiveNotification", payload);
    }
}
