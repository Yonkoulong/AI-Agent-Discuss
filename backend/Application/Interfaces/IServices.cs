using backend.Domain.Entities;

namespace backend.Application.Interfaces;

public interface IPostService
{
    Task<Post> CreatePostAsync(string ownerId, string content);
}

public interface ICommentService
{
    Task<Comment?> AddCommentAsync(int postId, string fromUserId, string content);
}

public interface IReplyService
{
    Task<Reply?> AddReplyAsync(int commentId, string fromUserId, string content);
}
