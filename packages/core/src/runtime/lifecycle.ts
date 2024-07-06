import { isPromise } from '../utils/is';

export enum LifeCycleList {
	CONNECTED_CALLBACK = 'connectedCallback',
	DISCONNECTED_CALLBACK = 'disconnectedCallback',
	ATTRIBUTE_CHANGED_CALLBACK = 'attributeChangedCallback',
	ADOPTED_CALLBACK = 'adoptedCallback',

	// COMPONENT_WILL_CREATE = 'componentWillCreate',
	// COMPONENT_DID_CREATE = 'componentDidCreate',
	COMPONENT_WILL_MOUNT = 'componentWillMount',
	COMPONENT_DID_MOUNT = 'componentDidMount',
	COMPONENT_WILL_UPDATE = 'componentWillUpdate',
	COMPONENT_DID_UPDATE = 'componentDidUpdate',
}

type CallLifecycleResult = {
	stop: boolean;
};

export type LifecycleCallback = () => void | boolean;

export function callLifecycle(target: any, lifecycle: LifeCycleList): CallLifecycleResult | void {
	if (!Array.isArray(target[lifecycle])) {
		throw new Error('lifecycle init error');
	}

	const result = [];
	for (const lifecycleCallback of target[lifecycle]) {
		const callbackResult = lifecycleCallback.call(target);
		if (isPromise(callbackResult)) {
			throw new Error(`${lifecycle} callback must be sync`);
		}
		result.push(callbackResult);
	}

	if (lifecycle === LifeCycleList.COMPONENT_WILL_MOUNT && result.some((i) => i === false)) {
		return { stop: true };
	}
}
