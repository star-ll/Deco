import { createJob, queueJob, SchedulerJob } from '../runtime/scheduler';
import { ObserverOptions } from '../types';
import { isArray, isObject, isPlainObject } from '../utils/is';
import { Effect } from './effect';

const proxyMap = new WeakMap<object, object>();

export function createReactive(targetElement: any, target: unknown, options: ObserverOptions = {}) {
	const { lazy, deep, autoDeepReactive = true } = options;
	const statePool = Reflect.getMetadata('statePool', targetElement as any);

	if (!isObject(target)) {
		return target;
	}

	statePool.initState(target, new Set(Object.keys(target)));

	const proxyTarget = new Proxy(target, {
		get(target, key, receiver) {
			if (Effect.target && Effect.target.targetElement === targetElement) {
				statePool.set(target, key, Effect.target);
			}

			return Reflect.get(target, key, receiver);
		},

		set(target, key, value, receiver) {
			// const isNewProperty = !Reflect.has(target, key);
			// metadata.statePool.set(target, key);

			const oldValue = Reflect.get(target, key, receiver);
			Reflect.set(target, key, autoDeepReactive ? createReactive(targetElement, value) : value, receiver);

			// isNewProperty ? metadata.statePool.notify(target) : metadata.statePool.notify(target, key);

			statePool.notify(target, key);

			return true;
		},

		deleteProperty(target, key) {
			Reflect.deleteProperty(target, key);
			statePool.delete(target, key);

			return true;
		},
	});

	proxyMap.set(proxyTarget, target);

	if (deep) {
		const targetKeys = Object.keys(target);
		const targetObject = target as Record<string | symbol, unknown>;
		targetKeys.forEach((key) => {
			const value = targetObject[key];
			targetObject[key] = createReactive(targetElement, value, options);
		});
	}

	return proxyTarget;
}

/**
 * change prop only method
 */
let escapePropSealFlag = false;
export function escapePropSet(target: any, prop: string, value: any) {
	escapePropSealFlag = true;
	target[prop] = value;
	escapePropSealFlag = false;
}

export function observe(
	target: any,
	name: string | symbol,
	originValue: any,
	options: ObserverOptions = { deep: true },
) {
	let value = originValue;
	const { lazy, deep, isProp, autoDeepReactive = true } = options;
	const statePool = Reflect.getMetadata('statePool', target as any);

	if (isPlainObject(value) || (isArray(value) && deep)) {
		target[name] = deep ? createReactive(target, value, options) : value;
		return;
	}

	return Object.defineProperties(target, {
		[name]: {
			get() {
				if (Effect.target && Effect.target.targetElement === target) {
					statePool.set(target, name, Effect.target);
				}

				return value;
			},
			set(newValue: unknown) {
				if (isProp) {
					if (!escapePropSealFlag) {
						console.warn(`prop ${String(name)} can not be set`);
						return;
					} else {
						escapePropSealFlag = false;
					}
				}

				const oldValue = value;
				value = autoDeepReactive ? createReactive(target, newValue, options) : newValue;

				statePool.notify(target, name);
				return true;
			},
		},
	});
}

export class StatePool {
	private isInitState: boolean = false;
	private statePool: WeakMap<object, Map<string | symbol, Set<Effect>>> = new WeakMap();

	constructor() {}

	initState(target: object, stateKeys: Set<string>) {
		if (this.isInitState) {
			throw new Error('StatePool has been initialized');
		}

		const depKeyMap = this.statePool.get(target) || this.statePool.set(target, new Map()).get(target);
		stateKeys.forEach((key) => {
			if (depKeyMap!.has(key)) {
				return;
			}
			depKeyMap!.set(key, new Set());
		});

		// this.isInitState = true;
	}

	set(target: object, name: string | symbol, effect?: Effect) {
		if (proxyMap.has(target)) {
			// target is a proxy
			target = proxyMap.get(target)!;
			if (!target) {
				throw new Error(`${target} is a proxy, but proxyMap has no target`);
			}
		}

		const depKeyMap = this.statePool.get(target) || this.statePool.set(target, new Map()).get(target);
		const deps = depKeyMap!.get(name) || depKeyMap!.set(name, new Set()).get(name);
		if (effect) {
			deps?.add(effect);
		}
	}

	setAll(target: object, Effect: Effect) {
		const depKeyMap = this.statePool.get(target) || this.statePool.set(target, new Map()).get(target);
		depKeyMap?.forEach((deps) => {
			deps.add(Effect);
		});
	}

	delete(target: object, name: string | symbol, effect?: Effect) {
		const depKeyMap = this.statePool.get(target);
		if (!depKeyMap) {
			throw new Error(`${target} has no state ${String(name)}`);
		}
		const deps = depKeyMap.get(name);
		if (!deps) {
			return;
		}
		if (!effect) {
			// effect?.cleanup?.();
			return;
		}
		deps.delete(effect);
	}

	notify(target: object, name: string | symbol) {
		const depKeyMap = this.statePool.get(target) || this.statePool.set(target, new Map()).get(target);
		const deps = depKeyMap!.get(name) || depKeyMap!.set(name, new Set()).get(name);
		deps?.forEach((effect: Effect) => {
			if (effect.scheduler) {
				effect.scheduler(target);
			} else {
				queueJob(createJob(effect.run.bind(effect)));
			}
		});
	}
}
