import { render } from './src/patch';
import { Fragment } from './src/const';
import { jsx } from './src/jsx';

(function (global: any) {
	global.__deco_h_ = jsx;
	global.__deco_Fragment = Fragment;
})(globalThis);

export { jsx, Fragment, render };
