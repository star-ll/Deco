import { LifecycleCallback } from '../runtime/lifecycle';
import type { StatePool } from '../reactive/observe';

export type ObserverOptions = {
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

export interface DecoWebComponent {
	readonly uid: number;
	shadowRootLink: ShadowRoot;

	componentWillMountList: LifecycleCallback[];
	componentDidMountList: LifecycleCallback[];
	shouldComponentUpdateList: LifecycleCallback[];
	componentDidUpdateList: LifecycleCallback[];
	connectedCallbackList: LifecycleCallback[];
	disconnectedCallbackList: LifecycleCallback[];
	attributeChangedCallbackList: LifecycleCallback[];
	adoptedCallbackList: LifecycleCallback[];
}
