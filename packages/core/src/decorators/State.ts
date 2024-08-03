import { DecoratorContextObject } from '../types';

export default function State() {
	return function (value: unknown, context: DecoratorContext) {
		if ((context as DecoratorContextObject).static) {
			throw new Error('@State decorator must be used on a instance property');
		}

		const metadata = context.metadata;
		if (!metadata) {
			throw new Error('no metadata');
		}
		if (context.kind !== 'field') {
			throw new Error('@Prop decorator must be used on a field property');
		}

		const stateKeys: Set<unknown> = (metadata?.stateKeys as Set<unknown>) || (metadata.stateKeys = new Set());
		stateKeys.add(context.name);
	};
}
