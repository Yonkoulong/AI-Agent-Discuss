using backend.Api.DTOs;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _service;
    public PostsController(IPostService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create(CreatePostDto dto)
    {
        var post = await _service.CreatePostAsync(dto.OwnerId, dto.Content);
        return Ok(post);
    }
}

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _service;
    public CommentsController(ICommentService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create(CreateCommentDto dto)
    {
        var comment = await _service.AddCommentAsync(dto.PostId, dto.FromUserId, dto.Content);
        return comment is null ? NotFound(new { error = "Post not found" }) : Ok(comment);
    }
}

[ApiController]
[Route("api/[controller]")]
public class RepliesController : ControllerBase
{
    private readonly IReplyService _service;
    public RepliesController(IReplyService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create(CreateReplyDto dto)
    {
        var reply = await _service.AddReplyAsync(dto.CommentId, dto.FromUserId, dto.Content);
        return reply is null ? NotFound(new { error = "Comment not found" }) : Ok(reply);
    }
}
