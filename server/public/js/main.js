import { dotnet } from '../_framework/dotnet.js';
import { write_line, fill_ellipse, color_black, GL, _eglCreateContext, _eglCreateWindowSurface } from '../splashKit/SplashKitBackendWASM.js';

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
        },
        SplashKitBackendWASM: {
            write_line,
            fill_ellipse: () => {
                fill_ellipse(color_black(), 0, 400, 800, 400);
            },
        }
    });

    const config = getConfig();
    const exports = await getAssemblyExports(config.mainAssemblyName);
    return exports;
};

const CompileAndRun = async (code) => {
    try {
        const exports = await loadDotNet();
        const result = await exports.CSharpCodeRunner.CompileAndRun(code);
        const outputElement = document.querySelector('#output');
        outputElement.textContent = result;
    } catch (error) {
        console.error('Error during code execution:', error);
    }
};

const runButton = document.querySelector('#run');
const textArea = document.querySelector('#code');
runButton.addEventListener('click', () => CompileAndRun(textArea.value));
