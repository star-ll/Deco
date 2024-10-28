/**
 * 根据elementType生成一个唯一随机字符串
 * @param elementType 元素类型
 * @returns {string} 唯一随机字符串
 */
export function generateDataIndex(elementType: string) {
	const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return `${elementType}-${randomStr}`;
}

export function attributesMapToString(attributes: { [key: string]: string | boolean }): string {
	return Object.keys(attributes)
		.map((key) => (attributes[key] ? `${key}="${attributes[key]}"` : false))
		.filter((i) => !!i)
		.join(' ');
}

export function parseElementAttribute(attr: string) {
	let result = attr;

	switch (attr) {
		case 'false':
			return false;
		case 'true':
			return true;
		case 'null':
			return null;
		case 'undefined':
			return undefined;
		case 'NaN':
			return NaN;
		case 'Infinity':
			return Infinity;
	}

	if (/^\d+$/.test(attr)) {
		return Number(attr);
	}

	try {
		result = JSON.parse(attr);
	} catch (e) {
		//
	}

	return result;
}

export function isComponent(element: any) {
	return element && element.__isComponent__;
}

export function flagComponent(element: any) {
	element.__isComponent__ = true;
}
