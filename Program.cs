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
var backupsDirectory = Path.Combine(dataDirectory, "backups");
if (!Directory.Exists(backupsDirectory))
{
    Directory.CreateDirectory(backupsDirectory);
}

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
        else if (type == "survey" || type == "wellbeing")
        {
            List<object> list = new();
            if (dict.ContainsKey("surveys"))
            {
                var existingJson = JsonSerializer.Serialize(dict["surveys"]);
                list = JsonSerializer.Deserialize<List<object>>(existingJson) ?? new List<object>();
            }
            list.Insert(0, payload);
            dict["surveys"] = list;
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

// API: Create local server backup snapshot
app.MapPost("/api/backup/create", () =>
{
    if (!File.Exists(dbPath)) return Results.NotFound(new { message = "No data file to backup." });
    var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
    var fileName = $"hrms_backup_{timestamp}.json";
    var targetPath = Path.Combine(backupsDirectory, fileName);
    File.Copy(dbPath, targetPath, true);
    var fi = new FileInfo(targetPath);
    return Results.Ok(new
    {
        success = true,
        fileName = fileName,
        timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
        fileSize = fi.Length
    });
});

// API: Download current database as backup file
app.MapGet("/api/backup/download", async () =>
{
    if (!File.Exists(dbPath)) return Results.NotFound(new { message = "No data file found." });
    var bytes = await File.ReadAllBytesAsync(dbPath);
    var downloadName = $"Sanasa_HRMS_Backup_{DateTime.Now:yyyy-MM-dd_HHmm}.json";
    return Results.File(bytes, "application/json", downloadName);
});

// API: List local backups
app.MapGet("/api/backup/list", () =>
{
    var list = new List<object>();
    if (Directory.Exists(backupsDirectory))
    {
        var files = new DirectoryInfo(backupsDirectory).GetFiles("*.json").OrderByDescending(f => f.CreationTime);
        foreach (var f in files)
        {
            list.Add(new
            {
                fileName = f.Name,
                createdAt = f.CreationTime.ToString("yyyy-MM-dd HH:mm:ss"),
                size = f.Length
            });
        }
    }
    return Results.Ok(new { success = true, backups = list });
});

// API: Restore from a specific server backup file or payload
app.MapPost("/api/backup/restore", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    string? restoreContent = null;
    
    if (!string.IsNullOrWhiteSpace(body))
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.ValueKind == JsonValueKind.Object && doc.RootElement.TryGetProperty("fileName", out var fileProp))
            {
                var targetFile = Path.Combine(backupsDirectory, fileProp.GetString() ?? "");
                if (File.Exists(targetFile))
                {
                    restoreContent = await File.ReadAllTextAsync(targetFile);
                }
            }
            else if (doc.RootElement.ValueKind == JsonValueKind.Object && doc.RootElement.TryGetProperty("organization", out _))
            {
                restoreContent = body;
            }
        }
        catch { }
    }

    if (string.IsNullOrWhiteSpace(restoreContent))
    {
        return Results.BadRequest(new { error = "Invalid restore payload or backup file not found." });
    }

    await File.WriteAllTextAsync(dbPath, restoreContent);
    var wwwrootDataDir = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "data");
    if (!Directory.Exists(wwwrootDataDir)) Directory.CreateDirectory(wwwrootDataDir);
    await File.WriteAllTextAsync(Path.Combine(wwwrootDataDir, "hrms_data.json"), restoreContent);

    return Results.Ok(new { success = true, timestamp = DateTime.Now });
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
