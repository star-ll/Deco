import { flagComponent, parseElementAttribute } from '../utils/element';
import { Fragment, jsx, render } from '@decoco/renderer';
import { escapePropSet, observe, StatePool } from '../reactive/observe';
import { ComponentEffect, Effect } from '../reactive/effect';
import { expToPath } from '../utils/share';
// import { isDevelopment } from '../utils/is';
import { callLifecycle, LifecycleCallback, LifeCycleList } from '../runtime/lifecycle';
import { createJob, queueJob } from '../runtime/scheduler';
import { doWatch } from './Watch';
import { DecoPlugin } from '../api/plugin';
import { isObjectAttribute } from '../utils/is';

export interface DecoWebComponent {
	[K: string | symbol]: any;
	readonly uid: number;

	componentWillMountList: LifecycleCallback[];
	componentDidMountList: LifecycleCallback[];
	componentWillUpdateList: LifecycleCallback[];
	componentDidUpdateList: LifecycleCallback[];
	connectedCallbackList: LifecycleCallback[];
	disconnectedCallbackList: LifecycleCallback[];
	attributeChangedCallbackList: LifecycleCallback[];
	adoptedCallbackList: LifecycleCallback[];
}

interface ComponentDecoratorOptions {
	// tag name
	tag: string;
	// style string or style sheet object
	style: string | StyleSheet;
}

let uid = 0;

/**
 * Why not use the class name as the tag name?
 * Because third-party minification plugins may obfuscate the actual class names
 * during the build process.
 */
type LegacyComponentOptions = Pick<ComponentDecoratorOptions, 'tag'> & Partial<Omit<ComponentDecoratorOptions, 'tag'>>;
type ComponentOptions = Partial<Omit<ComponentDecoratorOptions, 'tag'>>;
export function Component(tag: string, options?: ComponentOptions): any;
export function Component(options: LegacyComponentOptions): any;
export default function Component(tagOrOptions: string | LegacyComponentOptions, options?: ComponentOptions) {
	return function (target: any) {
		// todo: validate tag

		let tag, style;
		if (typeof tagOrOptions === 'string') {
			// new options
			tag = tagOrOptions;
		} else {
			// legacy options
			style = tagOrOptions.style || '';
			tag = tagOrOptions.tag;
		}

		const observedAttributes = target.prototype.__propKeys || [];

		customElements.define(String(tag), getCustomElementWrapper(target, { tag, style, observedAttributes }));
	};
}

type CustomElementWrapperOptions = {
	tag: string;
	style?: string | StyleSheet;
	observedAttributes: string[];
};
function getCustomElementWrapper(target: any, { tag, style, observedAttributes }: CustomElementWrapperOptions): any {
	return class WebComponent extends target implements DecoWebComponent {
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

			const componentUpdateEffect = new Effect(__updateComponent.bind(this)) as ComponentEffect;
			function __updateComponent(this: WebComponent) {
				if (this.__mounted) {
					const updateCallbackResult = callLifecycle(this, LifeCycleList.COMPONENT_WILL_UPDATE);
					if (updateCallbackResult && updateCallbackResult.stop) {
						return;
					}
				}

				{
					// componentUpdateEffect.effect = this.__updateComponent;
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
			this.initRefs();
			this.initState();
			this.initProps();
			this.initWatch();
			this.initEventAndListen();
			this.initLifecycle();

			callLifecycle(this, LifeCycleList.COMPONENT_WILL_MOUNT);
			this.__updateComponent();
			this.__mounted = true;
			callLifecycle(this, LifeCycleList.COMPONENT_DID_MOUNT);

			const plugins = this.getPlugins?.();
			// console.log(plugins);
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

		initRefs() {
			const refs = Reflect.getMetadata('refs', this);

			refs?.keys()?.forEach((refKey: keyof this) => {
				(this as any)[refKey] = { current: undefined };
			});
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

			Array.from(propKeys.keys()).forEach((name: any) => {
				const attr = this.getAttribute(name);
				observe(this, name, this.hasAttribute(name) && !isObjectAttribute(attr) ? attr : this[name], {
					isProp: true,
				});

				// prop map to html attribute
				if (!this.hasAttribute(name) && this[name] !== undefined && this[name] !== null) {
					queueJob(createJob(() => this.setAttribute(name, this[name])));
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
				const { watchKeys, watchMethodName } = item;
				watchKeys.forEach((watchKey: string) => {
					const { ctx, property } = expToPath(watchKey, this);

					const watchEffect = new Effect(() => this[watchKey]);

					doWatch(this, watchMethodName, watchEffect, property, statePool, item.options);
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
			if (isObjectAttribute(newValue)) {
				// Do not need to handle object prop
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
