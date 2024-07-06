import { Effect } from '../reactive/effect';

const callbacks: Array<Effect> = [];
let pending = false;

function flushCallbacks() {
	pending = false;
	const depEffectQueue = callbacks.slice();
	const copies = [];
	const callbackIdMap = new Map();

	// deduplicating
	for (let i = depEffectQueue.length - 1; i >= 0; i--) {
		const Effect = depEffectQueue[i];
		const id = Effect.id;
		if (callbackIdMap.has(id)) {
			continue;
		}
		callbackIdMap.set(id, true);
		copies.unshift(Effect);
	}

	callbacks.length = 0;
	for (let i = 0; i < copies.length; i++) {
		copies[i].run();
	}
}

export function nextTick(effect?: Effect, ctx?: object) {
	let _resolve: (arg0: object | undefined) => void;

	if (effect) {
		callbacks.push(effect);
	} else {
		const effect = new Effect(() => {
			_resolve(ctx);
		});
		callbacks.push(effect);
	}
	if (!pending) {
		pending = true;
		Promise.resolve().then(flushCallbacks);
	}
	// $flow-disable-line
	if (!Effect && typeof Promise !== 'undefined') {
		return new Promise((resolve) => {
			_resolve = resolve;
		});
	}
}
