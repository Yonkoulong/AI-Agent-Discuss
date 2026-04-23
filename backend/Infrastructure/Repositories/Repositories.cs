using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Persistence;

namespace backend.Infrastructure.Repositories;

public class PostRepository : IPostRepository
{
    private readonly AppDbContext _db;
    public PostRepository(AppDbContext db) => _db = db;

    public async Task<Post> AddAsync(Post post)
    {
        _db.Posts.Add(post);
        await _db.SaveChangesAsync();
        return post;
    }

    public async Task<Post?> GetByIdAsync(int id) => await _db.Posts.FindAsync(id);
}

public class CommentRepository : ICommentRepository
{
    private readonly AppDbContext _db;
    public CommentRepository(AppDbContext db) => _db = db;

    public async Task<Comment> AddAsync(Comment comment)
    {
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        return comment;
    }

    public async Task<Comment?> GetByIdAsync(int id) => await _db.Comments.FindAsync(id);
}

public class ReplyRepository : IReplyRepository
{
    private readonly AppDbContext _db;
    public ReplyRepository(AppDbContext db) => _db = db;

    public async Task<Reply> AddAsync(Reply reply)
    {
        _db.Replies.Add(reply);
        await _db.SaveChangesAsync();
        return reply;
    }
}
