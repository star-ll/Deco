import { createJob, queueJob } from '../runtime/scheduler';
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
				const effect = Effect.target;
				const targetElement = Effect.target.targetElement;
				effect.captureSelf(target, key, targetElement);
			}

			return Reflect.get(target, key, receiver);
		},

		set(target, key, value, receiver) {
			Reflect.set(target, key, autoDeepReactive ? createReactive(targetElement, value) : value, receiver);
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

	const isDeepReactive = (isPlainObject(value) || isArray(value)) && deep;
	value = isDeepReactive && deep ? createReactive(target, value, options) : value;

	return Object.defineProperties(target, {
		[name]: {
			get() {
				if (Effect.target && Effect.target.targetElement === target) {
					const effect = Effect.target;
					effect.captureSelf(target, name);
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

				console.log(statePool, name, newValue);
				statePool.delete(this, name);
				value = autoDeepReactive ? createReactive(target, newValue, options) : newValue;

				statePool.notify(target, name);
				return true;
			},
		},
	});
}

export class StatePool {
	private isInitState: boolean = false;
	private store: WeakMap<object, Map<string | symbol, Set<Effect>>> = new WeakMap();

	constructor() {}

	initState(target: object, stateKeys: Set<string>) {
		if (this.isInitState) {
			throw new Error('StatePool has been initialized');
		}

		const depKeyMap = this.store.get(target) || this.store.set(target, new Map()).get(target);
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

		const depKeyMap = this.store.get(target) || this.store.set(target, new Map()).get(target);
		const deps = depKeyMap!.get(name) || depKeyMap!.set(name, new Set()).get(name);
		if (effect) {
			deps?.add(effect);
		}
	}

	setAll(target: object, Effect: Effect) {
		const depKeyMap = this.store.get(target) || this.store.set(target, new Map()).get(target);
		depKeyMap?.forEach((deps) => {
			deps.add(Effect);
		});
	}

	delete(target: object, name: string | symbol, effect?: Effect) {
		const depKeyMap = this.store.get(target);
		if (!depKeyMap) {
			console.error(new Error(`${target} has no state ${String(name)}`));
			return;
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
		const depKeyMap = this.store.get(target) || this.store.set(target, new Map()).get(target);
		const deps = depKeyMap!.get(name) || depKeyMap!.set(name, new Set()).get(name);
		deps?.forEach((effect: Effect) => {
			if (effect.scheduler) {
				effect.scheduler(target);
			} else {
				queueJob(createJob(effect.run.bind(effect), effect.id));
			}
		});
	}
}
