import { isFunction } from '../utils/is';

export function Event(eventInit: EventInit = { composed: true }) {
	return function eventEmit(value: unknown, context: DecoratorContext) {
		return function (this: any) {
			return new EventEmitter(this, { ...eventInit });
		};
	};
}

export interface ListenOptions extends AddEventListenerOptions {
	target?: 'body' | 'document' | 'window';
}

export function Listen(eventName: string, listenOptions: ListenOptions = {}) {
	return function listen(this: any, value: Function, context: DecoratorContext) {
		context.addInitializer(function (this: unknown) {
			if (!isFunction(value)) {
				throw new Error(`@Listen: ${value} is not a function.`);
			}

			const { once, passive, capture, signal, target } = listenOptions;
			let listenTarget: any;
			switch (target) {
				case 'body': {
					listenTarget = document.body;
					break;
				}
				case 'document': {
					listenTarget = document;
					break;
				}
				case 'window': {
					listenTarget = window;
					break;
				}
				default: {
					listenTarget = this;
				}
			}
			listenTarget.addEventListener(eventName, value, { once, passive, signal, capture });
		});
	};
}

export class EventEmitter<T extends { ev: string; value: any } = { ev: string; value: unknown }> {
	eventInit: EventInit;
	customElement: HTMLElement;
	constructor(customElement: HTMLElement, eventInit: EventInit = {}) {
		this.eventInit = eventInit;
		this.customElement = customElement;
	}

	emit(eventName: T['ev'], value: T['value']) {
		const event = new CustomEvent(eventName, { detail: value, ...this.eventInit });
		this.customElement.dispatchEvent(event);
	}
}
