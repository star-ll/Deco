import { bindEscapePropSet, bindComponentFlag } from '../utils/element';
import { jsx, render } from '@decoco/renderer';
import { observe, StatePool } from '../reactive/observe';
import { Effect, effectStack } from '../reactive/effect';
import { expToPath } from '../utils/share';
import { forbiddenStateAndPropKey } from '../utils/const';
import { callLifecycle, LifecycleCallback, LifeCycleList } from '../runtime/lifecycle';
import { createJob, queueJob } from '../runtime/scheduler';
import { doWatch, WatchCallback } from './Watch';
import { DecoPlugin } from '../api/plugin';
import { isDefined, isObjectAttribute, isString, isUndefined } from '../utils/is';
import { warn } from '../utils/error';
import { EventEmitter } from './Event';
import { applyChange, diff } from 'deep-diff';
import rfdc from 'rfdc';
import { DecoratorMetaKeys } from '../enums/decorators';
import { computed } from './Computed';
import { DecoWebComponent } from '../types/index';
import { DecoElement } from 'src/api/instance';

const clone = rfdc();

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
		let tag, style;
		if (typeof tagOrOptions === 'string') {
			// new options
			tag = tagOrOptions;
			style = options?.style;
		} else {
			// legacy options
			style = tagOrOptions.style || '';
			tag = tagOrOptions.tag;
		}

		const observedAttributes = target.prototype.props || [];

		if (customElements.get(tag)) {
			warn(`custom element ${tag} already exists`);
			return;
		}

		// Validate tag name
		const tagNamePattern = /^[a-zA-Z][a-zA-Z0-9-]*$/;
		if (!tagNamePattern.test(tag)) {
			warn(
				`Invalid tag name: ${tag}. Tag names must start with a letter and contain only letters, digits, and hyphens.`,
			);
		}

		// displayName is used to create html element in decoco-renderer
		target.displayName = tag;

		customElements.define(String(tag), getCustomElementWrapper(target, { tag, style, observedAttributes }));
	};
}

type CustomElementWrapperOptions = {
	tag: string;
	style?: string | StyleSheet;
	observedAttributes: string[];
};
function getCustomElementWrapper(
	target: typeof DecoElement,
	{ tag, style, observedAttributes }: CustomElementWrapperOptions,
): any {
	return class WebComponent extends target implements DecoWebComponent {
		uid = ++uid;
		shadowRootLink: ShadowRoot;
		__updateComponent: () => void;
		__mounted = false;

		componentWillMountList: LifecycleCallback[] = [];
		componentDidMountList: LifecycleCallback[] = [];
		shouldComponentUpdateList: LifecycleCallback[] = [];
		componentDidUpdateList: LifecycleCallback[] = [];
		connectedCallbackList: LifecycleCallback[] = [];
		disconnectedCallbackList: LifecycleCallback[] = [];
		attributeChangedCallbackList: LifecycleCallback[] = [];
		adoptedCallbackList: LifecycleCallback[] = [];

		// can't use "Reflect.getMetadata('propKeys', this)", because this is not initialized yet
		static observedAttributes = observedAttributes;

		constructor() {
			super();
			this.shadowRootLink = this.attachShadow({ mode: 'open' }); // save shadowRoot for close mode.

			const componentUpdateEffect = new Effect(__updateComponent.bind(this));
			function __updateComponent(this: WebComponent) {
				if (this.__mounted) {
					const updateCallbackResult = callLifecycle(this, LifeCycleList.SHOULD_COMPONENT_UPDATE);
					if (updateCallbackResult && updateCallbackResult.stop) {
						return;
					}
				}

				{
					effectStack.push({
						effect: componentUpdateEffect,
						stateNode: this,
					});
					this.domUpdate();
					effectStack.pop();
				}

				if (this.__mounted) {
					callLifecycle(this, LifeCycleList.COMPONENT_DID_UPDATE);
				}
			}
			this.__updateComponent = __updateComponent.bind(this);
			this.forceUpdate = this.__updateComponent;

			bindComponentFlag(this);
			bindEscapePropSet(this);

			const statePool = new StatePool();
			Reflect.defineMetadata('statePool', statePool, this);

			this.validateStateAndPropKeys();
			this.initRefs();
			this.initState();
			this.initProps();
			this.initComputed();
			this.initWatch();
			this.initEventAndListen();
			this.initStore();
			this.initLifecycle();

			/**
			 * Delay render component to avoid child component did not mount
			 * when parent component did render
			 */
			const componentUpdateJob = createJob(() => {
				callLifecycle(this, LifeCycleList.COMPONENT_WILL_MOUNT);
				this.__updateComponent();
				this.__mounted = true;
				callLifecycle(this, LifeCycleList.COMPONENT_DID_MOUNT);
			});
			componentUpdateJob.id = this.uid;
			queueJob(componentUpdateJob);

			// todo: plugins
			// const plugins = this.getPlugins?.();
			// console.log(plugins);
		}

		validateStateAndPropKeys() {
			const stateKeys = Reflect.getMetadata('stateKeys', this);
			const propKeys = Reflect.getMetadata('propKeys', this);

			if (stateKeys && propKeys) {
				for (const propKey of propKeys.values()) {
					if (stateKeys.has(propKey)) {
						warn(
							`${String(tag)} ${propKey} can only be one state or prop, please change it to another name.`,
						);
					}
				}
			}

			if (stateKeys) {
				for (const key of stateKeys.values()) {
					if (forbiddenStateAndPropKey.has(key) || key in WebComponent.prototype) {
						warn(`${String(tag)} ${key} is a reserved keyword, please change it to another name.`);
					}
				}
			}

			if (propKeys) {
				for (const key of propKeys.values()) {
					if (forbiddenStateAndPropKey.has(key)) {
						warn(`${String(tag)} ${key} is a reserved keyword, please change it to another name.`);
					}
				}
			}
		}

		validateSomeInStateOrProps(validateKeys: Array<string>) {
			const stateKeys: Set<string> = Reflect.getMetadata('stateKeys', this);
			const propKeys: Set<string> = Reflect.getMetadata('propKeys', this);

			for (const key of validateKeys) {
				if (!stateKeys.has(key) && !propKeys.has(key)) {
					return key;
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
			Array.from(stateKeys.values()).forEach((name) => {
				const propertyName = name as keyof DecoElement;
				observe(this, propertyName, this[propertyName]);
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

			Array.from(propKeys.keys()).forEach((name: unknown) => {
				if (!isString(name)) {
					return;
				}
				const attr = this.getAttribute(name) as keyof DecoElement;
				const propertyName = name as keyof DecoElement;
				observe(this, name, this.hasAttribute(name) && !isObjectAttribute(attr) ? attr : this[propertyName], {
					isProp: true,
					deep: true,
					autoDeepReactive: true,
				});

				// prop map to html attribute
				if (!this.hasAttribute(name) && this[propertyName] !== undefined && this[propertyName] !== null) {
					queueJob(createJob(() => this.setAttribute(name, this[propertyName]?.toString() || '')));
				}
			});
		}

		initComputed() {
			const computedKeys = Reflect.getMetadata(DecoratorMetaKeys.computedKeys, this);
			if (!computedKeys) {
				return;
			}

			for (const key of computedKeys.values()) {
				const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

				if (isUndefined(descriptor?.get)) {
					warn(`computed property ${String(key)} has no getter`);
					continue;
				}

				const getter = descriptor.get.bind(this);
				const setter = descriptor.set?.bind(this);

				const computedDescriptor = computed.call(this, key, {
					get: getter,
					set: setter,
				});
				Object.defineProperty(this, key, { ...computedDescriptor, get: computedDescriptor.get });
			}
		}

		initWatch() {
			const watchers = Reflect.getMetadata('watchers', this);
			const statePool = Reflect.getMetadata('statePool', this);

			if (!watchers) {
				return;
			}

			for (const item of watchers) {
				const { watchKeys, watchMethodName } = item as {
					watchKeys: string[];
					watchMethodName: keyof DecoElement;
				};
				watchKeys.forEach((watchKey: string) => {
					const { ctx, property } = expToPath(watchKey, this) || {};
					if (!ctx || !property) {
						warn(`invalid watchKey ${watchKey}`);
						return;
					}

					const watchCallback = this[watchMethodName];
					if (!isDefined<WatchCallback>(watchCallback)) {
						warn(`watchCallback ${watchMethodName} is undefined`);
						return;
					}
					doWatch(this, watchCallback, ctx, property, statePool, item.options);
				});
			}
		}

		initEventAndListen() {
			const events = Reflect.getMetadata('events', this);
			const listens = Reflect.getMetadata('listens', this);

			if (events) {
				for (const eventName of events.keys()) {
					const eventInit = events.get(eventName);
					const eventEmit = new EventEmitter({ ...eventInit });
					eventEmit.setEventTarget(this);
					// @ts-ignore
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
			let rootVnode: any = this.render();

			//  style
			if (style instanceof CSSStyleSheet) {
				this.shadowRootLink.adoptedStyleSheets = [style];
			} else if (typeof style === 'string') {
				if (Array.isArray(rootVnode)) {
					rootVnode.unshift(jsx('style', {}, style));
				} else {
					rootVnode = [jsx('style', {}, style), rootVnode];
				}
			}

			// TODO: fix type error
			render(rootVnode, this.shadowRootLink as unknown as HTMLElement);
		}

		initLifecycle() {
			this.connectedCallbackList.push(super.connectedCallback);
			this.disconnectedCallbackList.push(super.disconnectedCallback);
			this.adoptedCallbackList.push(super.adoptedCallback);
			this.componentWillMountList.push(super.componentWillMount);
			this.componentDidMountList.push(super.componentDidMount);
			this.shouldComponentUpdateList.push(super.shouldComponentUpdate);
			this.componentDidUpdateList.push(super.componentDidUpdate);

			if (isDefined<LifecycleCallback>(super.attributeChangedCallback)) {
				this.attributeChangedCallbackList.push(super.attributeChangedCallback);
			}
		}

		initStore() {
			const stores = Reflect.getMetadata('stores', this);
			if (!stores) {
				return;
			}

			for (const propName of stores.keys() as (keyof DecoElement)[]) {
				const { store, getState = (state: unknown) => state } = stores.get(propName);
				const storeState = getState(store.getState());
				const obj = clone(storeState); // redux state is immutable
				observe(this, propName, obj);

				store.subscribe(() => {
					const currentState = clone(getState(store.getState()));

					const target = this[propName];
					const changes = diff(target, currentState);

					{
						/**
						 * deep-diff can't set the length of the array when diff array,
						 * so we need to set the length of the array to trigger the component update
						 */
						const arrayPaths = new Set<string | undefined>();
						changes?.forEach((change) => {
							if (change.kind === 'A' && change.item) {
								arrayPaths.add(change.path?.join('.'));
							}
						});

						changes?.forEach((change) => {
							applyChange(target, currentState, change);
						});

						arrayPaths.values().forEach((path) => {
							if (!path) {
								return;
							}
							let v = target;
							path.split('.').forEach((p) => {
								v = v[p];
							});
							if ('length' in v) {
								const size = v.length;
								v.length = size;
							}
						});
					}
				});
			}
		}

		attributeChangedCallback(name: string, oldValue: any, newValue: any) {
			callLifecycle(this, LifeCycleList.ATTRIBUTE_CHANGED_CALLBACK);

			// if (oldValue === null && newValue === null) {
			// 	return;
			// }
			// if (isObjectAttribute(newValue)) {
			// 	// Do not need to handle object prop
			// 	return;
			// }

			// escapePropSet(this, name, parseElementAttribute(newValue));
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
