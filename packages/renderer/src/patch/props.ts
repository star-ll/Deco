type Props = {
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
	if (['checked', 'selected', 'disabled', 'readOnly', 'contentEditable', 'draggable'].includes(propName)) {
		// 对于直接属性赋值的，进行类型检查和值的校验
		if (typeof value !== 'undefined') {
			(element as any)[propName] = value;
		}
	} else {
		try {
			if (Object.hasOwnProperty.call(HTMLElement.prototype, propName)) {
				(element as any)[propName] = value;
			} else {
				element.setAttribute(propName, value);
			}
		} catch (e) {
			console.error(`Error setting attribute '${propName}':`, e);
			// 错误处理逻辑
		}
	}
}

export function patchEvents(element: HTMLElement, props: Props, oldProps: Props) {
	// unmount old events
	for (const key of Object.keys(oldProps)) {
		if (key.startsWith('on') && typeof oldProps[key] === 'function') {
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
		if (key.startsWith('on')) {
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

	for (const propName of Object.keys(props)) {
		if (Object.prototype.hasOwnProperty.call(props, propName) && !['key', 'children'].includes(propName)) {
			const value = props[propName];

			if (value == null) continue;

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
					if (value != null) {
						element.className = value;
					}
					break;

				case 'style':
					handleStyleProps(element, value);
					break;

				case 'ref':
					if (typeof value === 'function') {
						value(element);
					} else if (typeof value === 'object' && value !== null && value.hasOwnProperty('current')) {
						value.current = element;
					} else {
						props[propName] = { current: element };
					}
					break;

				default:
					handleOtherProps(element, propName, value);
			}
		}
	}
}
