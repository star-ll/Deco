import 'reflect-metadata';

export * from './src/decorators/index';
export * from './src/plugins/index';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			[key: string]: any;
		}
	}
}

export { DecoElement } from './src/api/instance';
export * from './src/api/global-api';
export { ShadowRootSymbol } from './src/decorators/Component';
