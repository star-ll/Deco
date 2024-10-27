import type { StatePool } from '../reactive/observe';

export type ObserverOptions = {
	lazy?: boolean;
	deep?: boolean;
	autoDeepReactive?: boolean; // Automatic implementation of deep reactive
	isProp?: boolean;
};

export type RefType<T = any> = {
	current: T;
};

export type DecoratorMetadata = {
	statePool: StatePool;
	[key: string]: any;
};
