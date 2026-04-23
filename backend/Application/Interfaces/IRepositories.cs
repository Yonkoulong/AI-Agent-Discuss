using backend.Domain.Entities;

namespace backend.Application.Interfaces;

public interface IPostRepository
{
    Task<Post> AddAsync(Post post);
    Task<Post?> GetByIdAsync(int id);
}

public interface ICommentRepository
{
    Task<Comment> AddAsync(Comment comment);
    Task<Comment?> GetByIdAsync(int id);
}

public interface IReplyRepository
{
    Task<Reply> AddAsync(Reply reply);
}
