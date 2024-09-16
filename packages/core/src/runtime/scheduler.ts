import { warn } from 'src/utils/error';
import { Effect } from '../reactive/effect';

const callbacks: Array<SchedulerJob> = [];
const postCallbacks: Array<SchedulerJob> = [];
let pending = false;

let jobId = 1;
export interface SchedulerJob extends Function {
	id: number;
}
export function createJob(cb: Function): SchedulerJob {
	const job = cb as SchedulerJob;
	job.id = jobId++;
	return job;
}

function deduplicating(queue: Array<SchedulerJob>) {
	const callbackIdMap = new Map();
	const deduped = [...new Set(queue)];
	const result = [];

	// deduplicating
	for (let i = deduped.length - 1; i >= 0; i--) {
		const job = deduped[i];
		const id = job.id;
		if (callbackIdMap.has(id)) {
			continue;
		}
		callbackIdMap.set(id, true);
		result.unshift(job);
	}

	return result;
}

function flushCallbacks(cycles = 0) {
	pending = false;

	// deduplicating
	const copies = deduplicating(callbacks.slice());

	callbacks.splice(0, callbacks.length);
	for (let i = 0; i < copies.length; i++) {
		copies[i]();
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
		copies[i]();
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

export function queueJob(job: SchedulerJob) {
	const lastJob = callbacks[callbacks.length - 1];

	if (!lastJob || job.id >= lastJob.id) {
		callbacks.push(job);
	} else {
		const shouldInsertIndex = callbacks.findIndex((item) => item.id > job.id);
		callbacks.splice(shouldInsertIndex, 0, job);
	}

	queueFlush();
}

export function queuePostJob(job: SchedulerJob) {
	callbacks.push(job);
}

function queueFlush() {
	if (!pending) {
		pending = true;
		scheduler(flushCallbacks);
	}
}
