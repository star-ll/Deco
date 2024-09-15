import { flagComponent, parseElementAttribute } from '../utils/element';
import { Fragment, jsx, render } from '@deco/renderer';
import { escapePropSet, observe, StatePool } from '../reactive/observe';
import { Effect } from '../reactive/effect';
import { expToPath } from '../utils/share';
// import { isDevelopment } from '../utils/is';
import { callLifecycle, LifecycleCallback, LifeCycleList } from '../runtime/lifecycle';
import { queueJob } from '../runtime/scheduler';

let uid = 0;
export default function Component(options?: {
	// tag name
	tag?: string;

	// style string or style sheet object
	style?: string | StyleSheet;
}) {
	return function (target: any) {
		const tag =
			options?.tag ||
			String(target.name)
				.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
				.toLowerCase();
		const style = options?.style || '';
		const observedAttributes = target.prototype.__propKeys || [];

		customElements.define(String(tag), getCustomElementWrapper(target, { tag, style, observedAttributes }));
	};
}

type CustomElementWrapperOptions = {
	tag: string;
	style: string | StyleSheet;
	observedAttributes: string[];
};
function getCustomElementWrapper(target: any, { tag, style, observedAttributes }: CustomElementWrapperOptions): any {
	return class WebComponent extends target {
		uid = ++uid;

		__updateComponent: () => void;
		__mounted = false;

		componentWillMountList: LifecycleCallback[] = [];
		componentDidMountList: LifecycleCallback[] = [];
		componentWillUpdateList: LifecycleCallback[] = [];
		componentDidUpdateList: LifecycleCallback[] = [];
		connectedCallbackList: LifecycleCallback[] = [];
		disconnectedCallbackList: LifecycleCallback[] = [];
		attributeChangedCallbackList: LifecycleCallback[] = [];
		adoptedCallbackList: LifecycleCallback[] = [];

		// can't use "Reflect.getMetadata('propKeys', this)", because this is not initialized yet
		static observedAttributes = observedAttributes;

		constructor() {
			super();
			this.attachShadow({ mode: 'open' });

			const componentUpdateEffect = new Effect();
			function __updateComponent(this: WebComponent) {
				if (this.__mounted) {
					const updateCallbackResult = callLifecycle(this, LifeCycleList.COMPONENT_WILL_UPDATE);
					if (updateCallbackResult && updateCallbackResult.stop) {
						return;
					}
				}

				{
					componentUpdateEffect.setEffect(this.__updateComponent);
					Effect.target = componentUpdateEffect;
					Effect.target.targetElement = this;
					this.domUpdate();
					Effect.target = null;
				}

				callLifecycle(this, LifeCycleList.COMPONENT_DID_UPDATE);
			}
			this.__updateComponent = __updateComponent.bind(this);
			flagComponent(this);

			const statePool = new StatePool();
			Reflect.defineMetadata('statePool', statePool, this);

			this.validateStateAndPropKeys();
			this.initState();
			this.initProps();
			this.initWatch();
			this.initEventAndListen();
			this.initLifecycle();

			callLifecycle(this, LifeCycleList.COMPONENT_WILL_MOUNT);
			this.__updateComponent();
			this.__mounted = true;
			callLifecycle(this, LifeCycleList.COMPONENT_WILL_MOUNT);
		}

		validateStateAndPropKeys() {
			const stateKeys = Reflect.getMetadata('stateKeys', this);
			const propKeys = Reflect.getMetadata('propKeys', this);

			if (stateKeys && propKeys) {
				for (const propKey of propKeys.values()) {
					if (stateKeys.has(propKey)) {
						throw new Error(
							`${String(tag)} ${propKey} can only be one state or prop, please change it to another name.`,
						);
					}
				}
			}
		}

		initState() {
			const statePool = Reflect.getMetadata('statePool', this);
			const stateKeys = Reflect.getMetadata('stateKeys', this);

			if (!statePool) {
				throw new Error(`statePool is ${statePool}, initState error`);
			}
			if (!stateKeys) {
				return;
			}
			statePool.initState(this, Array.from(stateKeys));
			Array.from(stateKeys.values()).forEach((name: any) => {
				observe(this, name, this[name]);
			});
		}

		initProps() {
			const statePool = Reflect.getMetadata('statePool', this);
			const propKeys = Reflect.getMetadata('propKeys', this);

			if (!statePool) {
				throw new Error(`statePool is ${statePool}, initState error`);
			}
			if (!propKeys) {
				return;
			}

			statePool.initState(this, Array.from(propKeys));
			// automatically trigger re-render when prop change, so no need to setAll
			// statePool.setAll(this, this.__updateComponent);

			Array.from(propKeys.keys()).forEach((name: any) => {
				observe(this, name, this.hasAttribute(name) ? this.getAttribute(name) : this[name], {
					isProp: true,
				});

				if (!this.hasAttribute(name) && this[name] !== undefined && this[name] !== null) {
					queueJob(
						new Effect(() => {
							this.setAttribute(name, this[name]);
						}),
					);
				}
			});
		}

		initWatch() {
			const watchers = Reflect.getMetadata('watchers', this);
			const statePool = Reflect.getMetadata('statePool', this);

			if (!watchers) {
				return;
			}

			for (const item of watchers) {
				const { watchKeys, target } = item;
				watchKeys.forEach((watchKey: string) => {
					const { ctx, property } = expToPath(watchKey, this);

					const watchDep = new Effect((options: any) => {
						const { newValue, value } = options;

						target.call(this, newValue, value, () => {
							statePool.delete(ctx, property, watchDep);
						});
					});
					statePool.set(ctx, property, watchDep);
				});
			}
		}

		initEventAndListen() {
			const events = Reflect.getMetadata('events', this);
			const listens = Reflect.getMetadata('listens', this);

			if (events) {
				for (const eventName of events.keys()) {
					const eventEmit = events.get(eventName);
					eventEmit.setEventTarget(this);
					this[eventName] = eventEmit;
				}
			}

			if (listens) {
				for (const listen of listens.values()) {
					listen.call(this);
				}
			}
		}

		domUpdate() {
			// if (!this.root) {
			// 	throw new Error(`this.root is ${this.root}, render error`);
			// }
			// this.root.render(
			// 	<>
			// 		<style>{style}</style>
			// 		{this.render()}
			// 	</>,
			// );

			const vndoes = [this.render()];

			//  style
			if (style instanceof StyleSheet) {
				this.shadowRoot.adoptedStyleSheets = [style];
			} else if (typeof style === 'string') {
				vndoes.unshift(jsx('style', {}, style));
			}

			const fragment = jsx(Fragment, {}, ...vndoes);
			render(fragment, this.shadowRoot);
		}

		initLifecycle() {
			this.connectedCallbackList.push(super.connectedCallback);
			this.disconnectedCallbackList.push(super.disconnectedCallback);
			this.attributeChangedCallbackList.push(super.attributeChangedCallback);
			this.adoptedCallbackList.push(super.adoptedCallback);
			this.componentWillMountList.push(super.componentWillMount);
			this.componentDidMountList.push(super.componentDidMount);
			this.componentWillUpdateList.push(super.componentWillUpdate);
			this.componentDidUpdateList.push(super.componentDidUpdate);
		}

		attributeChangedCallback(name: string, oldValue: any, newValue: any) {
			callLifecycle(this, LifeCycleList.ATTRIBUTE_CHANGED_CALLBACK);

			if (oldValue === null && newValue === null) {
				return;
			}

			// const observedAttributes = WebComponent.observedAttributes;
			// if (!observedAttributes.includes(name)) {
			// 	return;
			// }
			// this[name] = parseElementAttribute(newValue);

			escapePropSet(this, name, parseElementAttribute(newValue));
		}

		connectedCallback() {
			callLifecycle(this, LifeCycleList.CONNECTED_CALLBACK);
		}

		disconnectedCallback() {
			callLifecycle(this, LifeCycleList.DISCONNECTED_CALLBACK);
		}

		adoptedCallback() {
			callLifecycle(this, LifeCycleList.ADOPTED_CALLBACK);
		}
	};
}
