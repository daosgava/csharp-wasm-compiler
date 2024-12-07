using System;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using System.Net.Http;
using SplashKitSDK;
using System.Threading.Tasks;

Console.WriteLine("Hello, Browser!");

public partial class CSharpResearch
{

    [JSExport]
    internal static string Greeting()
    {
        var text = $"Greetings from {GetHRef()}";
        Console.WriteLine(text + " (from Program.cs)");
        return text;
    }

    static async Task<MetadataReference> LoadAssemblyFromServer(string assemblyName)
    {
        var baseUrl = GetHRef();
        var url = $"/lib/{assemblyName}";

        try
        {
            using var httpClient = new HttpClient { BaseAddress = new Uri(baseUrl) };
            var assemblyBytes = await httpClient.GetByteArrayAsync(url);
            Console.WriteLine($"Loaded {assemblyName} from server.");
            return MetadataReference.CreateFromImage(assemblyBytes);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading assembly {assemblyName}: {ex.Message}");
            throw;
        }
    }

    [JSExport]
    internal static Task<string> CompileAndRun(string code)
    {
        return Task.Run(async () =>
        {
            try
            {
                var syntaxTree = CSharpSyntaxTree.ParseText(code);

                // Use Task.WhenAll to run async LoadAssemblyFromServer in parallel
                var references = await Task.WhenAll(
                    LoadAssemblyFromServer("mscorlib.dll"),
                    LoadAssemblyFromServer("netstandard.dll"),
                    LoadAssemblyFromServer("System.Console.dll"),
                    LoadAssemblyFromServer("System.Private.CoreLib.dll"),
                    LoadAssemblyFromServer("System.Runtime.dll")
                );

                var compilation = CSharpCompilation.Create(
                    assemblyName: "DynamicAssembly",
                    syntaxTrees: new[] { syntaxTree },
                    references: references,
                    options: new CSharpCompilationOptions(OutputKind.ConsoleApplication)
                );

                using var ms = new MemoryStream();
                var emitResult = compilation.Emit(ms);

                if (!emitResult.Success)
                {
                    var errors = string.Join("\n", emitResult.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error));
                    return $"Compilation failed:\n{errors}";
                }

                ms.Seek(0, SeekOrigin.Begin);
                var assembly = AppDomain.CurrentDomain.Load(ms.ToArray());

                var entryPoint = assembly.EntryPoint;
                if (entryPoint != null)
                {
                    var result = entryPoint.Invoke(null, null);
                    return result?.ToString() ?? "Execution complete, no output.";
                }

                return "No entry point found.";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        });
    }

    [JSImport("window.location.href", "main.js")]
    internal static partial string GetHRef();
}
