using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class CommentService : ICommentService
{
    private readonly IPostRepository _posts;
    private readonly ICommentRepository _comments;
    private readonly INotificationService _notifier;

    public CommentService(IPostRepository posts, ICommentRepository comments, INotificationService notifier)
    {
        _posts = posts;
        _comments = comments;
        _notifier = notifier;
    }

    public async Task<Comment?> AddCommentAsync(int postId, string fromUserId, string content)
    {
        var post = await _posts.GetByIdAsync(postId);
        if (post is null) return null;

        var comment = await _comments.AddAsync(new Comment
        {
            PostId = postId,
            OwnerId = fromUserId,
            Content = content
        });

        await _notifier.NotifyNewComment(post.OwnerId, new NotificationPayload(
            Type: NotificationType.NEW_COMMENT,
            PostId: post.Id,
            CommentId: comment.Id,
            FromUserId: fromUserId,
            Message: $"{fromUserId} commented on your post"
        ));

        return comment;
    }
}
