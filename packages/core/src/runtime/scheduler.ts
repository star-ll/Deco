import { Dep } from '../reactive/effect';

const callbacks: Array<Dep> = [];
let pending = false;

function flushCallbacks() {
	pending = false;
	const depEffectQueue = callbacks.slice();
	const copies = [];
	const callbackIdMap = new Map();

	// deduplicating
	for (let i = depEffectQueue.length - 1; i >= 0; i--) {
		const dep = depEffectQueue[i];
		const id = dep.id;
		if (callbackIdMap.has(id)) {
			continue;
		}
		callbackIdMap.set(id, true);
		copies.unshift(dep);
	}

	callbacks.length = 0;
	for (let i = 0; i < copies.length; i++) {
		copies[i].run();
	}
}

export function nextTick(dep?: Dep, ctx?: object) {
	let _resolve: (arg0: object | undefined) => void;

	if (dep) {
		callbacks.push(dep);
	} else {
		const dep = new Dep(() => {
			_resolve(ctx);
		});
		callbacks.push(dep);
	}
	if (!pending) {
		pending = true;
		Promise.resolve().then(flushCallbacks);
	}
	// $flow-disable-line
	if (!dep && typeof Promise !== 'undefined') {
		return new Promise((resolve) => {
			_resolve = resolve;
		});
	}
}
