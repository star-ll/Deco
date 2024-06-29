export enum LifeCycleList {
	CONNECTED_CALLBACK = 'connectedCallback',
	DISCONNECTED_CALLBACK = 'disconnectedCallback',
	ATTRIBUTE_CHANGED_CALLBACK = 'attributeChangedCallback',
	ADOPTED_CALLBACK = 'adoptedCallback',

	COMPONENT_WILL_CREATE = 'componentWillCreate',
	COMPONENT_DID_CREATE = 'componentDidCreate',
	COMPONENT_WILL_RENDER = 'componentWillRender',
	COMPONENT_DID_RENDER = 'componentDidRender',
	COMPONENT_WILL_UPDATE = 'componentWillUpdate',
	COMPONENT_DID_UPDATE = 'componentDidUpdate',
}

export function callLifecycle(el: any, lifecycle: LifeCycleList) {
	const event = new CustomEvent(lifecycle, {
		bubbles: true,
		composed: true,
		detail: {
			el,
		},
	});
	el.dispatchEvent(event);
}
