import { Effect } from 'src/reactive/effect';
import { DecoratorMetaKeys } from '../enums/decorators';
import { StatePool } from 'src/reactive/observe';

export default function Computed() {
	return function computed(target: any, propertyKey: string) {
		const computedKeys = Reflect.getMetadata(DecoratorMetaKeys.computedKeys, target) || new Set();
		computedKeys.add(propertyKey);
		Reflect.defineMetadata(DecoratorMetaKeys.computedKeys, computedKeys, target);
	};
}

export function computed(this: any, name: string, descriptor: { get: () => any; set?: (value: any) => any }) {
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const target = this;
	let dirty = true;
	let value: any;
	const statePool = Reflect.getMetadata('statePool', this) as StatePool;
	const getter = descriptor.get;
	const setter = descriptor.set;

	descriptor.get = function () {
		if (Effect.target) {
			const effect = Effect.target;
			effect.captureSelf(target, name);
		}

		const effect = new Effect(() => {
			dirty = true;
			statePool.notify(target, name);
		});

		if (dirty) {
			const lastEffectTarget = Effect.target;
			Effect.target = effect as any;
			(Effect.target as any).targetElement = target;
			value = getter();
			Effect.target = lastEffectTarget;

			dirty = false;
		}

		return value;
	};

	if (setter) {
		descriptor.set = function (value: unknown) {
			setter.call(target, value);
			dirty = true;
			statePool.notify(target, name);
		};
	}

	return descriptor;
}
