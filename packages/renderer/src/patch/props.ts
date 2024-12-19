import { isElementEventListener, isDefined, isObject } from 'src/is';

export type Props = {
	[key: string]: any;
};

function changeElemenProp(element: HTMLElement, propName: string, propValue: unknown) {
	if ('escapePropSet' in element && typeof element.escapePropSet === 'function') {
		element.escapePropSet(propName, propValue);
	} else {
		(element as any)[propName] = propValue;
	}
}

function handleInputProps(element: HTMLElement, propName: string, value: any) {
	const tag = element.tagName.toUpperCase();
	if (propName === 'defaultValue' && ['INPUT', 'TEXTAREA'].includes(tag)) {
		(element as HTMLInputElement).defaultValue = value;
	} else if (
		propName === 'defaultChecked' &&
		tag === 'INPUT' &&
		['checkbox', 'radio'].includes((element as HTMLInputElement).type)
	) {
		(element as HTMLInputElement).defaultChecked = value;
	} else if (
		propName === 'value' &&
		((tag === 'INPUT' && !['checkbox', 'radio'].includes((element as HTMLInputElement).type)) || tag === 'TEXTAREA')
	) {
		(element as HTMLInputElement).value = value;
	} else {
		element.setAttribute(propName, value);
	}
}

function handleStyleProps(element: HTMLElement, value: unknown) {
	if (isObject(value)) {
		for (const property of Object.keys(value)) {
			const propName = property as keyof CSSStyleDeclaration;
			const propValue = value[propName as keyof typeof value];
			if (propName !== 'length' && propName !== 'parentRule') {
				element.style[propName] = propValue;
			} else {
				console.error(`Unsupported CSS property: ${property}`);
			}
		}
	} else if (typeof value === 'string') {
		element.style.cssText = value;
	}
}

function handleOtherProps(element: HTMLElement, propName: string, value: unknown) {
	if (!isDefined(value)) {
		const property = (element as any)[propName];
		if (property !== undefined) {
			changeElemenProp(element, propName, undefined);
		}
		element.removeAttribute(propName);
	} else {
		try {
			if (propName in element) {
				changeElemenProp(element, propName, value);
			}
			element.setAttribute(propName, String(value));
		} catch (e) {
			console.error(`Error setting attribute '${propName}':`, e);
		}
	}
}

function parseEventName(eventName: string) {
	if (eventName.includes('-')) {
		// on-lowerCamelCase-Capture or on-UpperCamelCase or on-kebab-case-capture
		const parseEventName = eventName.split('-');
		const useCapture = parseEventName[parseEventName.length - 1].toLowerCase() === 'capture';
		return {
			useCapture,
			eventName: parseEventName
				.slice(1, useCapture ? parseEventName.length - 1 : parseEventName.length)
				.join('-'),
		};
	} else {
		// onUpperCamelCase
		const useCapture = eventName.endsWith('Capture');
		const parseEventName = eventName.slice(2, useCapture ? eventName.length - 7 : eventName.length);
		return {
			useCapture,
			eventName: parseEventName.toLowerCase(),
		};
	}
}

function patchEvents(element: HTMLElement, props: Props, oldProps: Props) {
	// unmount old events
	for (const key of Object.keys(oldProps)) {
		if (isElementEventListener(key) && typeof oldProps[key] === 'function') {
			const { eventName, useCapture } = parseEventName(key);
			element.removeEventListener(eventName, oldProps[key] as EventListener, useCapture);
		}
	}

	// add new events
	for (const key of Object.keys(props)) {
		if (isElementEventListener(key)) {
			if (typeof props[key] !== 'function') {
				console.error(new Error(`${element.tagName} ${key} must be a function!`));
			}

			const { eventName, useCapture } = parseEventName(key);
			element.addEventListener(eventName, props[key] as EventListener, useCapture);
		}
	}
}

export function patchProps(element: HTMLElement, props: Props, oldProps: Props) {
	patchEvents(element, props, oldProps);

	const handledProps = new Set();
	for (const propName of Object.keys(props)) {
		if (isElementEventListener(propName)) {
			// event has been handled
			continue;
		}
		if (!['key', 'children'].includes(propName)) {
			const value = props[propName];

			handleProps(element, propName, props, value);
			handledProps.add(propName);
		}
	}

	for (const propName of Object.keys(oldProps)) {
		if (!handledProps.has(propName)) {
			handleProps(element, propName, oldProps, undefined);
		}
	}
}

export function handleProps(element: HTMLElement, propName: string, props: Props, value: any) {
	try {
		if (Object.is(element[propName as keyof HTMLElement], value)) {
			return;
		}

		switch (propName) {
			case 'dangerouslySetInnerHTML':
				if (typeof value === 'object' && '__html' in value && value.__html != null) {
					// todo: xss
					element.innerHTML = value.__html;
				}
				break;

			case 'defaultValue':
			case 'defaultChecked':
			case 'value':
				handleInputProps(element, propName, value);
				break;

			case 'className':
				// 添加空值检查
				if (!isDefined<string>(value)) {
					element.removeAttribute('class');
				} else {
					element.className = value;
				}
				break;

			case 'style':
				handleStyleProps(element, value);
				break;

			case 'ref':
				if (typeof value === 'function') {
					value(element);
				} else if (
					typeof value === 'object' &&
					value !== null &&
					Object.prototype.hasOwnProperty.call(value, 'current')
				) {
					value.current = element;
				} else {
					props[propName] = { current: element };
				}
				break;

			default:
				handleOtherProps(element, propName, value);
		}
	} catch (err) {
		console.error(`Error setting attribute '${propName}':`, err);
	}
}
