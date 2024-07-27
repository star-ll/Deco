import { flagComponent, parseElementAttribute } from '../utils/element';
import { Fragment, render } from '@deco/renderer';
// import { createRoot } from 'react-dom/client';
import { escapePropSet, observe, StatePool } from '../reactive/observe';
import { Effect } from '../reactive/effect';
import { DecoratorContextObject, DecoratorMetadata } from '../types';
import { expToPath } from '../utils/share';
import { isDevelopment } from '../utils/is';
import { callLifecycle, LifecycleCallback, LifeCycleList } from '../runtime/lifecycle';

export type ComponentOptions = {
	// tag name
	tag?: string;

	// style string or style sheet object
	style?: string | StyleSheet;
};

let uid = 0;
export default function Component(options: ComponentOptions): any {
	return function (target: any, context: DecoratorContextObject) {
		// const diffParse = new DiffDOM();

		const metadata = context.metadata;
		if (!metadata) {
			throw new Error(`no meatedata`);
		}

		metadata.instance = target;

		const tag =
			options.tag ||
			String(context.name)
				.replace(/([A-Z])/g, '-$1')
				.toLowerCase();
		const style = options.style || '';

		if (target.observedAttributes) {
			throw new Error(`${String(tag)} already has observedAttributes. Please delete observedAttributes filed.`);
		}
		const observedAttributes = context.metadata?.props || new Set();

		metadata.statePool = new StatePool();

		customElements.define(
			String(tag),
			class WebComponent extends target {
				uid = ++uid;

				__updateComponent: () => void;
				__mounted = false;

				componentWillMount: LifecycleCallback[] = [];
				componentDidMount: LifecycleCallback[] = [];
				componentWillUpdate: LifecycleCallback[] = [];
				componentDidUpdate: LifecycleCallback[] = [];
				static observedAttributes = observedAttributes;

				constructor() {
					super();
					this.attachShadow({ mode: 'open' });

					const componentUpdateEffect = new Effect();
					function __updateComponent(this: WebComponent) {
						if (this.__mounted) {
							const updateCallbackResult = callLifecycle(this, LifeCycleList.COMPONENT_WILL_UPDATE);
							if (updateCallbackResult && updateCallbackResult.stop === true) {
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

					this.validateStateAndPropKeys();
					this.initState();
					this.initProps();
					this.initWatch();

					if (isDevelopment()) {
						this.__component_metadata = context.metadata;
					}

					callLifecycle(this, LifeCycleList.COMPONENT_WILL_MOUNT);
					this.__updateComponent();
					this.__mounted = true;
					callLifecycle(this, LifeCycleList.COMPONENT_WILL_MOUNT);
				}

				validateStateAndPropKeys() {
					const stateKeys = context.metadata?.stateKeys as Set<string>;
					const props = context.metadata?.props as Set<string>;

					if (stateKeys && props) {
						for (const propKey of props.values()) {
							if (stateKeys.has(propKey)) {
								throw new Error(
									`${String(tag)} ${propKey} can only be one state or prop, please change it to another name.`,
								);
							}
						}
					}
				}

				initState() {
					const statePool = context.metadata?.statePool as StatePool;
					const stateKeys = context.metadata?.stateKeys as Set<string>;
					if (!statePool) {
						throw new Error(`statePool is ${statePool}, initState error`);
					}
					if (!stateKeys) {
						return;
					}
					statePool.initState(this, stateKeys);
					Array.from(stateKeys.values()).forEach((name) => {
						observe(this, name, this[name], context.metadata);
					});
				}

				initProps() {
					const statePool = context.metadata?.statePool as StatePool;
					const props = context.metadata?.props as Set<string>;
					if (!props) {
						return;
					}

					statePool.initState(this, props);
					// automatically trigger re-render when prop change, so no need to setAll
					// statePool.setAll(this, this.__updateComponent);

					Array.from(props.values()).forEach((name) => {
						observe(
							this,
							name,
							this.hasAttribute(name) ? this.getAttribute(name) : this[name],
							context.metadata,
							{ isProp: true },
						);

						if (!this.hasAttribute(name) && this[name] !== undefined && this[name] !== null) {
							this.setAttribute(name, this[name]);
						}
					});
				}

				initWatch() {
					const metadata = context.metadata as DecoratorMetadata;
					const watchers = metadata.watchers;

					if (!watchers) {
						return;
					}

					for (const item of watchers) {
						const { watchKeys, target } = item;
						watchKeys.forEach((watchKey) => {
							const { ctx, property } = expToPath(watchKey, this);
							console.log('watch', (ctx as any).person, property);

							const watchDep = new Effect((options: any) => {
								const { newValue, value } = options;

								target.call(this, newValue, value, () => {
									metadata.statePool.delete(ctx, property, watchDep);
								});
							});
							metadata.statePool.set(ctx, property, watchDep);
						});
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

					const { __deco_h_: h } = globalThis as any;
					const vndoes = [this.render()];

					//  style
					if (style instanceof StyleSheet) {
						this.shadowRoot.adoptedStyleSheets = [style];
					} else if (typeof style === 'string') {
						vndoes.unshift(h('style', {}, style));
					}

					const fragment = h(Fragment, {}, ...vndoes);
					render(fragment, this.shadowRoot);
				}

				attributeChangedCallback(name: string, oldValue: any, newValue: any) {
					if (oldValue === null && newValue === null) {
						return;
					}

					if (!observedAttributes.has(name)) {
						return;
					}
					// this[name] = parseElementAttribute(newValue);
					escapePropSet(this, name, parseElementAttribute(newValue));
				}

				initLifecycle() {}
			} as any,
		);
	};
}
