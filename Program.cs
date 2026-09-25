using System.Net;
using System.Net.Sockets;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on all interfaces (port 5000) so LAN devices can scan QR codes
builder.WebHost.ConfigureKestrel(options =>
{
    options.Listen(IPAddress.Any, 5000);
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

var dataDirectory = Path.Combine(app.Environment.ContentRootPath, "data");
if (!Directory.Exists(dataDirectory))
{
    Directory.CreateDirectory(dataDirectory);
}
var dbPath = Path.Combine(dataDirectory, "hrms_data.json");

// Helper to get local IPv4 addresses
string[] GetLocalIpAddresses()
{
    var list = new List<string>();
    try
    {
        var host = Dns.GetHostEntry(Dns.GetHostName());
        foreach (var ip in host.AddressList)
        {
            if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
            {
                list.Add(ip.ToString());
            }
        }
    }
    catch
    {
        // ignored
    }
    return list.ToArray();
}

// API: System status & network IP
app.MapGet("/api/status", () =>
{
    return Results.Ok(new
    {
        status = "online",
        organization = "Galapitiyagama Sanasa Cooperative Society Ltd",
        organizationSinhala = "ගලපිටියගම සනස සමුපකාර සමිතිය",
        serverTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
        port = 5000,
        localIps = GetLocalIpAddresses()
    });
});

// API: Load entire system data
app.MapGet("/api/data", async () =>
{
    if (!File.Exists(dbPath))
    {
        return Results.NotFound(new { message = "No data found yet" });
    }
    var json = await File.ReadAllTextAsync(dbPath);
    return Results.Content(json, "application/json; charset=utf-8");
});

// API: Save entire system data
app.MapPost("/api/data", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var json = await reader.ReadToEndAsync();
    await File.WriteAllTextAsync(dbPath, json);
    
    var wwwrootDataDir = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "data");
    if (!Directory.Exists(wwwrootDataDir)) Directory.CreateDirectory(wwwrootDataDir);
    await File.WriteAllTextAsync(Path.Combine(wwwrootDataDir, "hrms_data.json"), json);
    
    return Results.Ok(new { success = true, timestamp = DateTime.Now });
});

// API: Direct submission from QR mobile forms
app.MapPost("/api/quick-submit", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var json = await reader.ReadToEndAsync();
    
    // We append the submission safely into data
    try
    {
        using var incomingDoc = JsonDocument.Parse(json);
        var type = incomingDoc.RootElement.GetProperty("type").GetString();
        var payload = incomingDoc.RootElement.GetProperty("data");

        string currentContent = "{}";
        if (File.Exists(dbPath))
        {
            currentContent = await File.ReadAllTextAsync(dbPath);
        }
        
        var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(currentContent) ?? new Dictionary<string, object>();
        
        if (type == "grievance")
        {
            List<object> list = new();
            if (dict.ContainsKey("grievances"))
            {
                var existingJson = JsonSerializer.Serialize(dict["grievances"]);
                list = JsonSerializer.Deserialize<List<object>>(existingJson) ?? new List<object>();
            }
            list.Insert(0, payload);
            dict["grievances"] = list;
        }
        else if (type == "member_feedback")
        {
            List<object> list = new();
            if (dict.ContainsKey("memberFeedbacks"))
            {
                var existingJson = JsonSerializer.Serialize(dict["memberFeedbacks"]);
                list = JsonSerializer.Deserialize<List<object>>(existingJson) ?? new List<object>();
            }
            list.Insert(0, payload);
            dict["memberFeedbacks"] = list;
        }
        
        var updatedJson = JsonSerializer.Serialize(dict, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(dbPath, updatedJson);
        return Results.Ok(new { success = true });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

Console.WriteLine("===============================================================");
Console.WriteLine(" Galapitiyagama Sanasa Cooperative Society - HRMS System");
Console.WriteLine(" ගලපිටියගම සනස සමුපකාර සමිතිය - මානව සම්පත් කළමනාකරණ පද්ධතිය");
Console.WriteLine("===============================================================");
Console.WriteLine(" System is running on:");
Console.WriteLine(" -> Local: http://localhost:5000");
foreach (var ip in GetLocalIpAddresses())
{
    Console.WriteLine($" -> Wi-Fi/LAN (For Mobile QR Scan): http://{ip}:5000");
}
Console.WriteLine("===============================================================");

app.Run();
