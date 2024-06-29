export default function Prop() {
	return function (value: any, context: DecoratorContext) {
		if ((context as any).stitic) {
			throw new Error('@Prop decorator must be used on a instance property');
		}

		const metadata = context.metadata;
		if (!metadata || context.kind !== 'field') {
			throw new Error('@Prop decorator must be used on a class property');
		}
		const props: Set<string | symbol> = (metadata?.props as Set<string | symbol>) || (metadata.props = new Set());
		props.add(context.name);
	};
}
