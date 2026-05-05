using Microsoft.AspNetCore.SignalR;

namespace backend.Api.Hubs;

public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    public ChatHub(ILogger<ChatHub> logger) => _logger = logger;

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {Id}", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {Id}", Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task SendPost(string postId, string author, string title, string body)
    {
        _logger.LogInformation("New post by {Author}: {Title}", author, title);

        var post = new
        {
            id = postId,
            author,
            title,
            body,
            createdAt = DateTime.UtcNow
        };

        // Broadcast new post to all clients
        await Clients.All.SendAsync("ReceivePost", post);
    }

    public async Task SendMessage(string user, string message)
    {
        _logger.LogInformation("{User}: {Message}", user, message);
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendComment(string commentId, string postId, string author, string text, string? parentId)
    {
        _logger.LogInformation("Comment by {Author} on post {PostId}: {Text}", author, postId, text);

        var groupName = $"post-{postId}";

        // Send comment to all clients in post group (including sender)
        var comment = new
        {
            id = commentId,
            postId,
            author,
            text,
            parentId,
            createdAt = DateTime.UtcNow
        };
        await Clients.Group(groupName).SendAsync("ReceiveComment", comment);

        // Broadcast notification to all clients except sender
        var notification = new
        {
            id = Guid.NewGuid().ToString(),
            type = parentId == null ? "NEW_COMMENT" : "NEW_REPLY",
            postId,
            commentId,
            message = $"{author} commented: {text}",
            createdAt = DateTime.UtcNow,
            read = false
        };

        await Clients.Others.SendAsync("ReceiveNotification", notification);
    }

    public async Task JoinPostGroup(string groupName)
    {
        _logger.LogInformation("Client {Id} joined group {GroupName}", Context.ConnectionId, groupName);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeavePostGroup(string groupName)
    {
        _logger.LogInformation("Client {Id} left group {GroupName}", Context.ConnectionId, groupName);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }
}
