import fastGlob from 'fast-glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ScanPatterns = string[]

async function scanFiles(scanPatterns: ScanPatterns) {
	const patterns = scanPatterns || ['src/**/*.(tsx|jsx)'];
	const files = await fastGlob(patterns, { cwd: process.cwd() });
	return files.map((file) => path.resolve(process.cwd(), file));
}

export default function decocoInjectComponent(scanPatterns: ScanPatterns) {
	const virtualModuleId = 'virtual:decoco';
	const resolvedVirtualModuleId = '\0' + virtualModuleId;
	let componentFiles;

	return {
		name: '@decoco/rollup-plugin-auto-inject-component',

		resolveId(id:string) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		async load(id: string) {
			if (id === resolvedVirtualModuleId) {
				try {
					componentFiles = await scanFiles(scanPatterns);

					const result = componentFiles.map((i) => `import "${i}"`).join('\n') + '\n';
					return result;
				} catch (error) {
					console.error('Error scanning files:', error);
				}
			}
		},
	};
}
