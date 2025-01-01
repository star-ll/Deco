import { StatePool } from './observe';
import { DecoWebComponent } from '../types/index';

export type EffectOptions = {
	value?: any;
	oldValue?: any;
	cleanup?: (...args: unknown[]) => void;
	scheduler?: (...args: unknown[]) => void;
};
export type EffectTarget =
	| ((value: unknown, oldValue?: unknown, cleanup?: (...args: unknown[]) => void) => any)
	| Function;

let uid = 1;

export class Effect {
	id = uid++;
	effect: (...args: any[]) => unknown;
	scheduler?: (...args: unknown[]) => void;
	cleanup: Set<(...args: unknown[]) => void> = new Set();

	constructor(effect: (...args: any[]) => unknown, options: EffectOptions = {}) {
		const { scheduler, cleanup } = options;
		this.effect = effect;
		this.scheduler = scheduler;

		// todo
		if (cleanup) {
			this.cleanup.add(cleanup);
		}
	}

	run(...args: any[]) {
		return this.effect(...args);
	}

	captureSelf(target: any, name: string | number | symbol, instance?: any) {
		const statePool: StatePool = Reflect.getMetadata('statePool', instance || target);
		statePool.set(target, name, this);
	}

	execCleanup() {
		for (const cleanup of this.cleanup.values()) {
			cleanup();
		}
	}
}

export type EffectStackItem = {
	effect: Effect;
	stateNode: DecoWebComponent;
};

export class EffectStack {
	private static instance: EffectStack;
	private stack: EffectStackItem[] = [];

	private constructor() {}

	static getInstance(): EffectStack {
		if (!EffectStack.instance) {
			EffectStack.instance = new EffectStack();
		}
		return EffectStack.instance;
	}

	push(effect: EffectStackItem) {
		this.stack.push(effect);
	}

	pop() {
		return this.stack.pop();
	}

	get current() {
		return this.stack[this.stack.length - 1];
	}
}

export const effectStack = Object.freeze(EffectStack.getInstance());
