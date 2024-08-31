import 'reflect-metadata';
import { jsx as h, Fragment } from '@deco/renderer';

export * from './src/decorators/index';
import { Effect } from './src/reactive/effect';
import { nextTick } from './src/runtime/scheduler';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			// 'test-event-emit': any; // 初始可以先用any，后续根据需要细化类型
			[key: string]: any;
		}
	}
}

function nextTickApi(this: any, callback: Function, ctx?: object) {
	return nextTick.call(this, new Effect(callback, ctx));
}
export { nextTickApi as nextTick };

export class DecoElement extends HTMLElement {
	static h = h;
	static Fragment = Fragment;

	componentWillMount() {}
	componentDidMount() {}
	componentWillUpdate() {}
	componentDidUpdate() {}
	connectedCallback() {}
	disconnectedCallback() {}
	adoptedCallback() {}
	attributeChangedCallback?(name: string, oldValue: any, newValue: any) {}

	static use() {
		return this;
	}

	static globalStyle() {
		return this;
	}

	render() {}
}
