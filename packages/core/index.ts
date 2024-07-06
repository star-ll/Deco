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

export abstract class WebComponent extends HTMLElement {
	componentWillMount?(): void;
	componentDidMount?(): void;
	componentWillUpdate?(): boolean | void;
	componentDidUpdate?(): void;
	connectedCallback?(): void;
	disconnectedCallback?(): void;
	adoptedCallback?(): void;
	attributeChangedCallback?(): void;

	abstract render(): JSX.Element;
}
