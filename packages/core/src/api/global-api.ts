import { nextTick } from '../runtime/scheduler';

function nextTickApi(this: any, callback: Function) {
	return nextTick.call(this, callback);
}
export { nextTickApi };
