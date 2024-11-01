export default function State() {
	return function (target: any, value: unknown) {
		// if ((context as DecoratorContextObject).static) {
		// 	throw new Error('@State.md decorator must be used on a instance property');
		// }

		// const metadata = context.metadata;
		// const stateKeys: Set<unknown> = (metadata?.stateKeys as Set<unknown>) || (metadata.stateKeys = new Set());
		// stateKeys.add(context.name);

		const stateKeys = Reflect.getMetadata('stateKeys', target) || new Set();
		stateKeys.add(value);
		Reflect.defineMetadata('stateKeys', stateKeys, target);
	};
}
