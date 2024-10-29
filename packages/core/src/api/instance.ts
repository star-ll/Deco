import { jsx as h, Fragment } from '@decoco/renderer';
import { nextTickApi } from './global-api';
import { DecoPlugin } from './plugin';

export class DecoElement extends DecoPlugin {
	static h = h;
	static Fragment = Fragment;

	componentWillMount() {}
	componentDidMount() {}
	shouldComponentUpdate() {
		return true;
	}
	componentDidUpdate() {}
	connectedCallback() {}
	disconnectedCallback() {}
	adoptedCallback() {}
	attributeChangedCallback?(name: string, oldValue: any, newValue: any) {}

	$nextTick(this: any, callback: Function) {
		return nextTickApi.call(this, callback);
	}

	render() {}
}
