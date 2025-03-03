import { createJob, queueJob } from '../runtime/scheduler';
import { ObserverOptions } from '../types';
import { isArray, isObject, isPlainObject } from '../utils/is';
import { Effect, effectStack } from './effect';
import { warn } from '../utils/error';

const proxyMap = new WeakMap<object, object>();
const isProxy = Symbol.for('isProxy');

// Define an interface that includes the symbol as a key
interface ProxyTarget {
	[isProxy]?: boolean;
	[key: string | number | symbol]: any;
}

export function createReactive(targetElement: any, target: unknown, options: ObserverOptions = {}) {
	const { deep, autoDeepReactive = true } = options;
	const statePool = Reflect.getMetadata('statePool', targetElement as any);

	if (!isObject<ProxyTarget>(target) || target[isProxy]) {
		return target;
	}

	statePool.initState(target, new Set(Object.keys(target)));

	const proxyTarget = new Proxy(target, {
		get(target, key, receiver) {
			if (effectStack.current && effectStack.current.stateNode === targetElement) {
				const effect = effectStack.current.effect;
				effect.captureSelf(target, key, effectStack.current.stateNode);
			}

			if (key === isProxy) {
				return true;
			}

			return Reflect.get(target, key, receiver);
		},

		set(target, key, value, receiver) {
			Reflect.set(target, key, autoDeepReactive ? createReactive(targetElement, value) : value, receiver);
			statePool.notify(target, key);
			// }
			// statePool.delete(target, key);

			return true;
		},

		deleteProperty(target, key) {
			Reflect.deleteProperty(target, key);
			statePool.delete(target, key);

			return true;
		},
	});

	if (deep) {
		for (const key of Object.keys(target)) {
			const descriptor = Object.getOwnPropertyDescriptor(target, key);
			if (!descriptor || descriptor?.writable) {
				const value = target[key as keyof typeof target];
				(target[key as keyof typeof target] as any) = createReactive(targetElement, value, options);
			}
		}
	}

	proxyMap.set(proxyTarget, target);

	return proxyTarget;
}

/**
 * change prop only method
 */
let escapePropSealFlag = false;
export function escapePropSet(target: any, prop: string | symbol, value: any) {
	escapePropSealFlag = true;
	target[prop] = value;
	escapePropSealFlag = false;
}

export function observe(
	target: any,
	name: string | number | symbol,
	originValue: any,
	options: ObserverOptions = { deep: true },
) {
	let value = originValue;
	const { deep = true, isProp, autoDeepReactive = true } = options;
	const statePool = Reflect.getMetadata('statePool', target as any);

	const isDeepReactive = (isPlainObject(value) || isArray(value)) && deep;
	value = isDeepReactive && deep ? createReactive(target, value, options) : value;

	return Object.defineProperties(target, {
		[name]: {
			get() {
				if (effectStack.current && effectStack.current.stateNode === target) {
					const effect = effectStack.current.effect;
					effect.captureSelf(target, name);
				}

				return value;
			},
			set(newValue: unknown) {
				if (Object.is(newValue, value)) {
					return;
				}

				// if (isProp) {
				// 	if (!escapePropSealFlag) {
				// 		return;
				// 	} else {
				// 		escapePropSealFlag = false;
				// 	}
				// }

				value = autoDeepReactive ? createReactive(target, newValue, options) : newValue;
				statePool.notify(target, name);

				// statePool.delete(this, name);

				return true;
			},
		},
	});
}

export class StatePool {
	private isInitState: boolean = false;
	private store: WeakMap<object, Map<string | number | symbol, Set<Effect>>> = new WeakMap();

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

	set(target: object, name: string | number | symbol, effect?: Effect) {
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

	delete(target: object, name: string | number | symbol, effect?: Effect) {
		const depKeyMap = this.store.get(target);
		if (!depKeyMap) {
			warn(`${target} has no state ${String(name)}`);
			return;
		}
		const deps = depKeyMap.get(name);
		if (!deps) {
			return;
		}
		if (!effect) {
			deps.values().forEach((effect: Effect) => {
				effect.execCleanup();
			});
			deps.clear();
			return;
		} else {
			if (!deps.has(effect)) {
				warn(`Not find effect. This possibly is a bug. Please report it.`);
			}
			deps.delete(effect);
			effect.execCleanup();
		}
	}

	notify(target: object, name: string | number | symbol) {
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
