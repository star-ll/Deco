export * from './src/decorators/index';
import { Dep } from './src/reactive/effect';
import { nextTick } from './src/runtime/scheduler';

/** fix decorator context.metadata is undefined */
(function (SymbolConstructor: any) {
	if (!SymbolConstructor.metadata) {
		SymbolConstructor.metadata = Symbol.for('Symbol.metadata');
	}
})(Symbol);

function nextTickApi(this: any, callback: Function, ctx?: object) {
	return nextTick.call(this, new Dep(callback, ctx));
}
export { nextTickApi as nextTick };
