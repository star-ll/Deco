import { isElementEventListener, isDefined } from 'src/is';

export type Props = {
	[key: string]: any;
};

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

function handleStyleProps(element: HTMLElement, value: any) {
	if (typeof value === 'object') {
		Object.assign(element.style, value);
	} else if (typeof value === 'string') {
		element.style.cssText = value;
	}
}

function handleOtherProps(element: HTMLElement, propName: string, value: any) {
	if (!isDefined(value)) {
		const property = (element as any)[propName];
		if (!Object.isFrozen(property) && property !== undefined) {
			(element as any)[propName] = undefined;
		}
		element.removeAttribute(propName);
	} else {
		try {
			if (propName in element) {
				(element as any)[propName] = value;
				element.setAttribute(propName, String(value));
			} else {
				element.setAttribute(propName, String(value));
			}
		} catch (e) {
			console.error(`Error setting attribute '${propName}':`, e);
		}
	}
}

function patchEvents(element: HTMLElement, props: Props, oldProps: Props) {
	// unmount old events
	for (const key of Object.keys(oldProps)) {
		if (isElementEventListener(key) && typeof oldProps[key] === 'function') {
			const useCapture = key.endsWith('Capture');
			let eventName = key.toLowerCase().slice(2);
			if (useCapture) {
				eventName = key.slice(0, -7).toLowerCase();
			}
			element.removeEventListener(eventName, oldProps[key] as EventListener, useCapture);
		}
	}

	// add new events
	for (const key of Object.keys(props)) {
		if (isElementEventListener(key)) {
			if (typeof props[key] !== 'function') {
				console.error(new Error(`${element.tagName} ${key} must be a function!`));
			}

			const useCapture = key.endsWith('Capture');
			let eventName = key.toLowerCase().slice(2);
			if (useCapture) {
				eventName = key.slice(0, -7).toLowerCase();
			}
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

			handlePros(element, propName, props, value);
			handledProps.add(propName);
		}
	}

	for (const propName of Object.keys(oldProps)) {
		if (!handledProps.has(propName)) {
			handlePros(element, propName, oldProps, undefined);
		}
	}
}

export function handlePros(element: HTMLElement, propName: string, props: Props, value: any) {
	try {
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
