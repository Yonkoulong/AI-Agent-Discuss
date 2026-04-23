namespace backend.Api.DTOs;

public record CreatePostDto(string OwnerId, string Content);
public record CreateCommentDto(int PostId, string FromUserId, string Content);
public record CreateReplyDto(int CommentId, string FromUserId, string Content);
