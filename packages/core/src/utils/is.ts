export function isDevelopment() {
	return process.env.NODE_ENV === 'development';
}

export function getTypeof(value: unknown): string {
	return Object.prototype.toString.call(value).slice(8, -1);
}

export function isObject<T extends object = object>(value: unknown): value is T {
	return typeof value === 'object' && value !== null;
}

export function isPlainObject<K = unknown>(value: unknown): value is { [key: string | symbol]: K } {
	return getTypeof(value) === 'Object';
}

export function isMap<T = unknown, K = unknown>(value: unknown): value is Map<T, K> {
	return getTypeof(value) === 'Map';
}

export function isSet<T = unknown>(value: unknown): value is Set<T> {
	return getTypeof(value) === 'Set';
}

export function isArray<T = unknown>(value: unknown): value is T[] {
	return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
	return typeof value === 'function';
}

export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
	return typeof value === 'number';
}

export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

export function isSymbol(value: unknown): value is symbol {
	return typeof value === 'symbol';
}

export function isUndefined(value: unknown): value is undefined {
	return typeof value === 'undefined';
}

export function isNull(value: unknown): value is null {
	return value === null;
}

export function isDefined<T>(value: unknown): value is T {
	return !isUndefined(value) && !isNull(value);
}

export function isBigInt(value: unknown): value is bigint {
	return typeof value === 'bigint';
}

export function isObjectAttribute(value: string): boolean {
	return /^\[object .+]$/.test(value);
}

export function isPrimitive(value: unknown): boolean {
	return (
		isNull(value) ||
		isUndefined(value) ||
		isBoolean(value) ||
		isNumber(value) ||
		isString(value) ||
		isSymbol(value) ||
		isBigInt(value)
	);
}

export function isEmpty(value: unknown): boolean {
	if (isNull(value) || isUndefined(value)) {
		return true;
	}

	if (isString(value)) {
		return value.length === 0;
	}

	if (isArray(value)) {
		return value.length === 0;
	}

	if (isSet(value) || isMap(value)) {
		return value.size === 0;
	}

	if (isPlainObject(value)) {
		return Object.keys(value).length === 0;
	}

	throw new Error('Unsupported type');
}

export function isPromise(value: unknown): value is Promise<unknown> {
	return value instanceof Promise;
}
