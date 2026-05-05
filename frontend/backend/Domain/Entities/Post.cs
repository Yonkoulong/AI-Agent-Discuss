namespace backend.Domain.Entities;

public class Post
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = default!;
    public string Content { get; set; } = default!;
}
