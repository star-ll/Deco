import { StatePool } from './observe';
import { DecoWebComponent } from '../decorators/Component';

export type EffectOptions = {
	value?: any;
	oldValue?: any;
	cleanup?: Function;
	scheduler?: Function;
};
export type EffectTarget = ((value: unknown, oldValue?: unknown, cleanup?: Function) => any) | Function;

export type ComponentEffect = Effect & { targetElement: DecoWebComponent };

let uid = 1;

export class Effect {
	static target: ComponentEffect | null = null;

	id = uid++;
	effect: (...args: any[]) => unknown;
	scheduler?: Function;
	cleanup?: Function;

	constructor(effect: (...args: any[]) => unknown, options: EffectOptions = {}) {
		const { scheduler, cleanup } = options;
		this.effect = effect;
		this.scheduler = scheduler;
		this.cleanup = cleanup;
	}

	run(...args: any[]) {
		return this.effect(...args);
	}

	captureSelf(target: any, name: string | symbol, instance?: any) {
		const statePool: StatePool = Reflect.getMetadata('statePool', instance || target);
		statePool.set(target, name, this);
	}
}
