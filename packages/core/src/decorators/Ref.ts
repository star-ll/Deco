export default function Ref() {
	return function (target: any, propertyKey: string) {
		const refTarget: RefType<HTMLElement | undefined> = {
			current: undefined,
		};

		const refs = Reflect.getMetadata('refs', target) || new Map();
		refs.set(propertyKey, refTarget);
		Reflect.defineMetadata('refs', refs, target);
	};
}

export type RefType<T = unknown> = {
	current: T;
};
