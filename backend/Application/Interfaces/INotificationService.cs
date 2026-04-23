using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface INotificationService
{
    Task NotifyNewComment(string postOwnerId, NotificationPayload payload);
    Task NotifyReply(string commentOwnerId, NotificationPayload payload);
}
