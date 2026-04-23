namespace backend.Domain.Entities;

public class Reply
{
    public int Id { get; set; }
    public int CommentId { get; set; }
    public string OwnerId { get; set; } = default!;
    public string Content { get; set; } = default!;
}
