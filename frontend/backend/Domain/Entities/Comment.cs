namespace backend.Domain.Entities;

public class Comment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string OwnerId { get; set; } = default!;
    public string Content { get; set; } = default!;
}
