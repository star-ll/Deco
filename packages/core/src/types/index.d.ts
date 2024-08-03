import type { StatePool } from '../reactive/observe';

export type DecoratorMetadata = {
	statePool: StatePool;
	instance: object;
	props: Set<string | symbol>;
	stateKeys: Set<string | symbol>;
	watchers: Set<{ watchKeys: string[]; target: Function }>;
	__updateComponent: Function;
};

export type DecoratorContextObject = DecoratorContext & {
	metadata: DecoratorMetadata;
	static: boolean;
	private: boolean;
};

// type ClassDecoratorContext = DecoratorContext;
// export type DecoratorContext = ClassDecoratorContext & { metadata: DecoratorMetadata };
// interface DecoratorContext {
// 	// kind: 'class';
// 	// name: string;
// 	// addInitializer(initializer: Function): void;
// 	// metadata: DecoratorMetadata;
// 	metadata: DecoratorMetadata;
// 	name: string;
// }
// export type DecoratorContext = {
// 	metadata: DecoratorMetadata;
// 	name: string;
// } & ClassDecoratorContext

export type ObserverOptions = {
	lazy?: boolean;
	deep?: boolean;
	autoDeepReactive?: boolean; // Automatic implementation of deep reactive
	isProp?: boolean;
};

export type RefType<T = any> = {
	current: T;
};
