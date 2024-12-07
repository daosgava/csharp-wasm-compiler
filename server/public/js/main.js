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
    return exports;
};

const exports = await loadDotNet();
const greeting = await exports.CSharpResearch.Greeting();
console.log(greeting);

const CompileAndRun = async (code) => {
    if (!exports) {
        console.error('Dotnet runtime is not yet initialized');
        return;
    }

    try {
        const result = await exports.CSharpResearch.CompileAndRun(code);
        const outputElement = document.querySelector('#output');
        outputElement.textContent = result;
    } catch (error) {
        console.error('Error during code execution:', error);
    }
};

const runButton = document.querySelector('#run');
const textArea = document.querySelector('#code');
runButton.addEventListener('click', () => CompileAndRun(textArea.value));
