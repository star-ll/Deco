import 'reflect-metadata';
import { jsx as h, Fragment } from '@deco/renderer';

export * from './src/decorators/index';
import { Effect } from './src/reactive/effect';
import { nextTick } from './src/runtime/scheduler';

/** fix decorator context.metadata is undefined */
(function (SymbolConstructor: any) {
	if (!SymbolConstructor.metadata) {
		SymbolConstructor.metadata = Symbol.for('Symbol.metadata');
	}
})(Symbol);

function nextTickApi(this: any, callback: Function, ctx?: object) {
	return nextTick.call(this, new Effect(callback, ctx));
}
export { nextTickApi as nextTick };

// export abstract class WebComponent extends HTMLElement {
// 	componentWillMount?(): void;
// 	componentDidMount?(): void;
// 	componentWillUpdate?(): boolean | void;
// 	componentDidUpdate?(): void;
// 	connectedCallback?(): void;
// 	disconnectedCallback?(): void;
// 	adoptedCallback?(): void;
// 	attributeChangedCallback?(): void;

// 	abstract render(): JSX.Element;
// }

export class DecoElement extends HTMLElement {
	static h = h;
	static Fragment = Fragment;

	componentWillMount?(): void;
	componentDidMount?(): void;
	componentWillUpdate?(): boolean | void;
	componentDidUpdate?(): void;
	connectedCallback?(): void;
	disconnectedCallback?(): void;
	adoptedCallback?(): void;
	attributeChangedCallback?(name: string, oldValue: any, newValue: any): void;

	render() {
		// return h(Fragment, {});
	}
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			// 'test-event-emit': any; // 初始可以先用any，后续根据需要细化类型
			[key: string]: any;
		}
	}
}
