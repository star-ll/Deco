import { jsx as h, Fragment } from '@deco/renderer';
import { nextTickApi } from './global-api';

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

	$nextTick(this: any, callback: Function) {
		return nextTickApi.call(this, callback);
	}

	render() {}
}
