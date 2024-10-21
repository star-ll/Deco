export default function Ref() {
	return function (target: any, propertyKey: string) {
		const refs = Reflect.getMetadata('refs', target) || new Map();
		refs.set(propertyKey, true);
		Reflect.defineMetadata('refs', refs, target);
	};
}

export type RefType<T = unknown> = {
	current: T;
};
