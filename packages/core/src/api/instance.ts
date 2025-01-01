import { jsx as h, Fragment } from '@decoco/renderer';
import { nextTickApi } from './global-api';
import { DecoPlugin } from './plugin';

type DecoElementAttributes = JSX.IntrinsicAttributes & React.HTMLAttributes<DecoElement>;

export class DecoElement<T = DecoElementAttributes> extends DecoPlugin {
	// jsx
	static h = h;
	static Fragment = Fragment;
	props: T & DecoElementAttributes = {} as T & DecoElementAttributes;
	context: any = {};
	setState: () => void = () => {};
	forceUpdate: () => void = () => {};
	state: any = {};
	refs: any = {};

	// lifecycles
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

	// hooks
	$nextTick(this: any, callback: Function) {
		return nextTickApi.call(this, callback);
	}

	render(): JSX.Element | void {}
}
