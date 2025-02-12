import { ShadowRootSymbol } from 'src/decorators/Component';
import { DecoWebComponent } from '../types';

interface GlobalStylesOptions {
	style: string;
	options?: {
		async?: boolean;
	};
}
export function globalStylesPlugin(pluginOptions: GlobalStylesOptions) {
	return {
		apply(app: DecoWebComponent) {
			const { style, options = {} } = pluginOptions;
			const { async = false } = options;
			const styleSheet = new CSSStyleSheet();
			async ? styleSheet.replace(style) : styleSheet.replaceSync(style);
			app[ShadowRootSymbol].adoptedStyleSheets = [...app[ShadowRootSymbol].adoptedStyleSheets, styleSheet];
		},
	};
}
