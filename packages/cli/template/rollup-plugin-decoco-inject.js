import fastGlob from 'fast-glob';
import path from 'path';

async function scanFiles(scanPatterns) {
	const patterns = scanPatterns || ['src/**/*.(tsx|jsx)'];
	const files = await fastGlob(patterns, { cwd: process.cwd() });
	const absoluteFiles = files.map((file) => path.resolve(process.cwd(), file));

	return absoluteFiles;
}

export default function vitePluginDecoInjectComponent(scanPatterns) {
	const virtualModuleId = 'virtual:decoco';
	const resolvedVirtualModuleId = '\0' + virtualModuleId;
	let componentFiles;

	return {
		name: 'plugin',

		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		async load(id) {
			if (id === resolvedVirtualModuleId) {
				try {
					componentFiles = await scanFiles(scanPatterns);
					// console.log(`Files with ${JSON.stringify(scanPatterns)} extension:`, componentFiles);

					const res =
						componentFiles
							.map(
								(i) => `import "${('.' + path.sep + path.relative(__dirname, i)).replace(/\\/g, '/')}"`,
							)
							.join('\n') + '\n';
					return res;
				} catch (error) {
					console.error('Error scanning files:', error);
				}
			}
		},
		async transform(code, id) {
			if (componentFiles && componentFiles.includes(path.resolve(id)) && id.endsWith('.comp.tsx')) {
				return '/* @Component {} */' + '\n' + code;
			}
		},
	};
}
