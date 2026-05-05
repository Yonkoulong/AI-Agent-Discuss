using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class ReplyService : IReplyService
{
    private readonly ICommentRepository _comments;
    private readonly IReplyRepository _replies;
    private readonly INotificationService _notifier;

    public ReplyService(ICommentRepository comments, IReplyRepository replies, INotificationService notifier)
    {
        _comments = comments;
        _replies = replies;
        _notifier = notifier;
    }

    public async Task<Reply?> AddReplyAsync(int commentId, string fromUserId, string content)
    {
        var comment = await _comments.GetByIdAsync(commentId);
        if (comment is null) return null;

        var reply = await _replies.AddAsync(new Reply
        {
            CommentId = commentId,
            OwnerId = fromUserId,
            Content = content
        });

        await _notifier.NotifyReply(comment.OwnerId, new NotificationPayload(
            Type: NotificationType.NEW_REPLY,
            PostId: comment.PostId,
            CommentId: comment.Id,
            FromUserId: fromUserId,
            Message: $"{fromUserId} replied to your comment"
        ));

        return reply;
    }
}
