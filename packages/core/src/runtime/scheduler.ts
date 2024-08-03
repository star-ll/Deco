import { warn } from 'src/utils/error';
import { Effect } from '../reactive/effect';

const callbacks: Array<Effect> = [];
let pending = false;

function flushCallbacks(cycles = 0) {
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

	if (callbacks.length) {
		if (cycles >= 100) {
			warn(`The number of scheduler callbacks exceeds the maximum limit of 100, please check the code.`);
			return;
		}
		flushCallbacks(cycles + 1);
	}
}

let scheduler: (callback: typeof flushCallbacks) => void;
if (typeof window.queueMicrotask === 'function') {
	scheduler = queueMicrotask;
} else if (Promise && typeof Promise.resolve === 'function') {
	scheduler = (callback: typeof flushCallbacks) => Promise.resolve(0).then(callback);
} else {
	warn(`Your browser does not support queueMicrotask and Promise!!`);
	scheduler = (callback: typeof flushCallbacks) => setTimeout(callback, 0);
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
		scheduler(flushCallbacks);
	}
	if (!Effect && typeof Promise !== 'undefined') {
		return new Promise((resolve) => {
			_resolve = resolve;
		});
	}
}
