export default function Ref() {
	return function (value: unknown, context: any) {
		if (context.static) {
			throw new Error('@Ref decorator must be used on a instance property');
		}

		context.addInitializer(function (this: any) {
			(this[context.name] as RefType<HTMLElement | undefined>) = {
				current: undefined,
			};
		});
	};
}

export type RefType<T = unknown> = {
	current: T;
};
