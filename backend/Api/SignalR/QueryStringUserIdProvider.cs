using Microsoft.AspNetCore.SignalR;

namespace backend.Api.SignalR;

/// <summary>Maps connections to user IDs via "?userId=&lt;id&gt;" query string.</summary>
public class QueryStringUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
        => connection.GetHttpContext()?.Request.Query["userId"];
}
