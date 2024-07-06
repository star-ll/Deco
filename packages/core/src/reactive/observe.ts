import { nextTick } from '../runtime/scheduler';
import { DecoratorMetadata, ObserverOptions } from '../types';
import { isArray, isObject, isPlainObject } from '../utils/is';
import { Effect, EffectTarget } from './effect';

const proxyMap = new WeakMap<object, object>();

export function createReactive(
	targetElement: any,
	target: unknown,
	metadata: DecoratorMetadata,
	options: ObserverOptions = {},
) {
	const { lazy, deep, autoDeepReative = true } = options;
	const statePool = metadata.statePool;

	if (!isObject(target)) {
		return target;
	}

	statePool.initState(target, new Set(Object.keys(target)));

	const proxyTarget = new Proxy(target, {
		get(target, key, receiver) {
			if (Effect.target && Effect.target.targetElement === targetElement) {
				metadata.statePool.set(target, key, Effect.target);
			}

			return Reflect.get(target, key, receiver);
		},

		set(target, key, value, receiver) {
			// const isNewProperty = !Reflect.has(target, key);
			// metadata.statePool.set(target, key);

			const oldValue = Reflect.get(target, key, receiver);
			Reflect.set(
				target,
				key,
				autoDeepReative ? createReactive(targetElement, value, metadata) : value,
				receiver,
			);

			// isNewProperty ? metadata.statePool.notify(target) : metadata.statePool.notify(target, key);

			metadata.statePool.notify(target, key, { value, oldValue });

			return true;
		},

		deleteProperty(target, key) {
			Reflect.deleteProperty(target, key);
			metadata.statePool.delete(target, key);

			return true;
		},
	});

	proxyMap.set(proxyTarget, target);

	if (deep) {
		Object.keys(target).forEach((key) => {
			const value = (target as any)[key];
			(target as any)[key] = createReactive(targetElement, value, metadata, options);
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
	metadata: DecoratorMetadata,
	options: ObserverOptions = { deep: true },
) {
	let value = originValue;
	const { lazy, deep, isProp, autoDeepReative = true } = options;

	if (isPlainObject(value) || (isArray(value) && deep)) {
		target[name] = deep ? createReactive(target, value, metadata, options) : value;
		return;
	}

	return Object.defineProperties(target, {
		[name]: {
			get() {
				if (Effect.target && Effect.target.targetElement === target) {
					metadata.statePool.set(target, name, Effect.target);
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
				value = autoDeepReative ? createReactive(target, newValue, metadata, options) : newValue;

				metadata.statePool.notify(target, name, { value, oldValue });
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

	set(target: object, name: string | symbol, Effect?: Effect) {
		if (proxyMap.has(target)) {
			// target is a proxy
			target = proxyMap.get(target)!;
			if (!target) {
				throw new Error(`${target} is a proxy, but proxyMap has no target`);
			}
		}

		const depKeyMap = this.statePool.get(target) || this.statePool.set(target, new Map()).get(target);
		const deps = depKeyMap!.get(name) || depKeyMap!.set(name, new Set()).get(name);
		if (Effect) {
			deps?.add(Effect);
		}
	}

	setAll(target: object, Effect: Effect) {
		const depKeyMap = this.statePool.get(target) || this.statePool.set(target, new Map()).get(target);
		depKeyMap?.forEach((deps) => {
			deps.add(Effect);
		});
	}

	delete(target: object, name: string | symbol, Effect?: Effect) {
		const depKeyMap = this.statePool.get(target);
		if (!depKeyMap) {
			throw new Error(`${target} has no state ${String(name)}`);
		}
		const deps = depKeyMap.get(name);
		if (!deps) {
			return;
		}
		if (!Effect) {
			deps.clear();
			return;
		}
		deps.delete(Effect);
	}

	notify(target: object, name: string | symbol, options?: { value: unknown; oldValue: unknown }) {
		const depKeyMap = this.statePool.get(target) || this.statePool.set(target, new Map()).get(target);
		const deps = depKeyMap!.get(name) || depKeyMap!.set(name, new Set()).get(name);
		deps?.forEach((Effect: Effect) => {
			if (options) {
				Effect.setOption(options);
			}

			nextTick(Effect);
		});
	}
}
