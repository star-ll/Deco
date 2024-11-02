import { DecoratorMetadata } from '../types';
import { createJob, queueJob, SchedulerJob } from '../runtime/scheduler';
import { Effect } from '../reactive/effect';
import { StatePool } from '../reactive/observe';
import { DecoWebComponent } from './Component';

export interface WatchOptions {
	once?: boolean;
	immediate?: boolean;
}

// todo: validate watchKeys
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
	instance: DecoWebComponent,
	watchMethodName: keyof DecoWebComponent,
	propertyCtx: any,
	property: string | symbol,
	statePool: StatePool,
	watchOptions: WatchOptions,
) {
	let oldValue: any;
	const watchEffect = new Effect(() => propertyCtx[property]);
	const job = createJob(() => {
		const newValue = watchEffect.run();

		const cleanup = () => {
			statePool.delete(propertyCtx, property, watchEffect);
		};

		instance[watchMethodName].call(instance, newValue, oldValue, cleanup);

		oldValue = newValue;

		if (watchOptions.once) {
			cleanup();
		}
	}, watchEffect.id);
	watchEffect.scheduler = () => queueJob(job);
	watchEffect.captureSelf(propertyCtx, property, instance);

	if (watchOptions.immediate) {
		job();
	} else {
		oldValue = watchEffect.run();
	}
}
