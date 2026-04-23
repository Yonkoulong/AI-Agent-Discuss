using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _posts;
    public PostService(IPostRepository posts) => _posts = posts;

    public Task<Post> CreatePostAsync(string ownerId, string content)
        => _posts.AddAsync(new Post { OwnerId = ownerId, Content = content });
}
