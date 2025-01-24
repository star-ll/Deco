import { nextTick } from '../runtime/scheduler';

function nextTickApi(this: any, callback: (...args: unknown[]) => void) {
	return nextTick.call(this, callback);
}
export { nextTickApi };
