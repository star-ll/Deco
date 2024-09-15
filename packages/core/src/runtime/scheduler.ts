import { warn } from 'src/utils/error';
import { Effect } from '../reactive/effect';

const callbacks: Array<Effect> = [];
const postCallbacks: Array<Effect> = [];
let pending = false;

function deduplicating(queue: Array<Effect>) {
	const callbackIdMap = new Map();
	const deduped = [...new Set(queue)];
	const result = [];

	// deduplicating
	for (let i = deduped.length - 1; i >= 0; i--) {
		const effect = deduped[i];
		const id = effect.id;
		if (callbackIdMap.has(id)) {
			continue;
		}
		callbackIdMap.set(id, true);
		result.unshift(effect);
	}

	return result;
}

function flushCallbacks(cycles = 0) {
	pending = false;

	// deduplicating
	const copies = deduplicating(callbacks.slice());

	callbacks.splice(0, callbacks.length);
	for (let i = 0; i < copies.length; i++) {
		copies[i].run();
	}

	flushPostCallbacks();

	if (callbacks.length) {
		if (cycles >= 100) {
			warn(`The number of scheduler callbacks exceeds the maximum limit of 100, please check the code.`);
			return;
		}
		flushCallbacks(cycles + 1);
	}
}

// todo: use flushPostCallbacks for watch(post type)
function flushPostCallbacks(cycles = 0) {
	// deduplicating
	const copies = deduplicating(postCallbacks.slice());

	postCallbacks.splice(0, postCallbacks.length);
	for (let i = 0; i < copies.length; i++) {
		copies[i].run();
	}

	if (callbacks.length && cycles >= 100) {
		warn(`The number of scheduler postCallbacks exceeds the maximum limit of 100, please check the code.`);
		return;
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

export function nextTick(cb?: Function) {
	if (cb) {
		return Promise.resolve().then(() => cb);
	}

	return Promise.resolve();
}

export function queueJob(effect: Effect) {
	const lastJob = callbacks[callbacks.length - 1];

	if (!lastJob || effect.id >= lastJob.id) {
		callbacks.push(effect);
	} else {
		const shouldInsertIndex = callbacks.findIndex((item) => item.id > effect.id);
		callbacks.splice(shouldInsertIndex, 0, effect);
	}

	queueFlush();
}

export function queuePostJob(effect: Effect) {
	callbacks.push(effect);
}

function queueFlush() {
	if (!pending) {
		pending = true;
		scheduler(flushCallbacks);
	}
}
