import { DecoratorMetadata } from '../types';
import { createJob, queueJob, SchedulerJob } from '../runtime/scheduler';
import { Effect } from '../reactive/effect';
import { StatePool } from '../reactive/observe';

export interface WatchOptions {
	once?: boolean;
	immediate?: boolean;
}

// todo： watchKeys param support ‘obj.s.a’
// todo: pre / sync / post
export default function Watch(watchKeys: any[] | never[], options: WatchOptions = {}) {
	return function (target: any, methodName: string, description: unknown) {
		const watchers = Reflect.getMetadata('watchers', target) || new Set();
		watchers.add({ watchKeys, watchMethodName: methodName, options });
		Reflect.defineMetadata('watchers', watchers, target);
	};
}

export function doWatch(
	ctx: any,
	watchMethodName: string,
	watchEffect: Effect,
	property: string | symbol,
	statePool: StatePool,
	watchOptions: WatchOptions,
) {
	let oldValue: any;
	const job = createJob(() => {
		const newValue = watchEffect.run();

		const cleanup = () => {
			statePool.delete(ctx, property, watchEffect);
		};
		ctx[watchMethodName].call(ctx, newValue, oldValue, cleanup);

		oldValue = newValue;

		if (watchOptions.once) {
			cleanup();
		}
	});
	watchEffect.scheduler = () => queueJob(job);
	statePool.set(ctx, property, watchEffect);

	if (watchOptions.immediate) {
		job();
	} else {
		oldValue = watchEffect.run();
	}
}
