import { isFunction } from '../utils/is';

export function Event(eventInit: EventInit = { composed: true, bubbles: true, cancelable: true }) {
	return function eventEmit(target: any, eventName: string) {
		const events = Reflect.getMetadata('events', target) || new Map();
		events.set(eventName, eventInit);
		Reflect.defineMetadata('events', events, target);
	};
}

export interface ListenOptions extends AddEventListenerOptions {
	target?: 'body' | 'document' | 'window';
}

export function Listen(eventName: string, listenOptions: ListenOptions = {}) {
	return function listen(target: any, methodKey: string) {
		const listenTarget = function (this: any) {
			const value: EventListenerOrEventListenerObject = this[methodKey];
			if (!isFunction(value)) {
				throw new Error(`@Listen: ${value} is not a function.`);
			}

			const { once, passive, capture, signal, target } = listenOptions;
			let listenTarget: Document | Window | HTMLElement;
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
					listenTarget = this as HTMLElement;
				}
			}
			listenTarget.addEventListener(eventName, value, { once, passive, signal, capture });
		};

		const listens = Reflect.getMetadata('listens', target) || new Map();
		listens.set(eventName, listenTarget);
		Reflect.defineMetadata('listens', listens, target);
	};
}

export class EventEmitter<T extends { ev: string; value: unknown } = { ev: string; value: unknown }> {
	eventInit: EventInit;
	customElement!: HTMLElement;
	constructor(eventInit: EventInit = {}) {
		this.eventInit = eventInit;
	}

	setEventTarget(customElement: HTMLElement) {
		this.customElement = customElement;
	}

	emit(eventName: T['ev'], value: T['value']) {
		const event = new CustomEvent(eventName, { detail: value, ...this.eventInit });
		this.customElement.dispatchEvent(event);
	}
}
