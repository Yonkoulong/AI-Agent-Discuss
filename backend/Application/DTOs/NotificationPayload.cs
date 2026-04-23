namespace backend.Application.DTOs;

public enum NotificationType
{
    NEW_COMMENT,
    NEW_REPLY
}

public record NotificationPayload(
    NotificationType Type,
    int PostId,
    int? CommentId,
    string FromUserId,
    string Message
);
