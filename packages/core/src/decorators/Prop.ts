export default function Prop() {
	return function (target: any, propertyKey: string) {
		const propKeys = Reflect.getMetadata('propKeys', target) || new Set();
		propKeys.add(propertyKey);
		Reflect.defineMetadata('propKeys', propKeys, target);

		Object.defineProperty(target, 'props', {
			writable: true,
			configurable: false,
			value: Array.from(propKeys),
			enumerable: false,
		});
	};
}
