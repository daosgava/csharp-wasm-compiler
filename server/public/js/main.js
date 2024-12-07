import { dotnet } from '../_framework/dotnet.js';

const loadDotNet = async () => {
    const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
        .withDiagnosticTracing(false)
        .withApplicationArgumentsFromQuery()
        .create();

    setModuleImports('main.js', {
        window: {
            location: {
                href: () => globalThis.window.location.href
            }
        }
    });

    const config = getConfig();
    const exports = await getAssemblyExports(config.mainAssemblyName);
    return { exports, config };
}

const { exports } = await loadDotNet();
const greetingOutput = exports.CSharpResearch.Greeting();
console.log(greetingOutput);
const code = `
using System;
public class Program
{
    public static void Main()
    {
        Console.WriteLine("Hello, World! Compiled and run from main.js");
    }
}
`;
await exports.CSharpResearch.CompileAndRun(code);

await dotnet.run();