import { DecoratorContextObject, DecoratorMetadata } from '../types';

//  todo： watchKeys param support ‘obj.s.a’
export default function Watch(watchKeys: any[] | never[]) {
	return function (target: Function, context: DecoratorContext) {
		if ((context as DecoratorContextObject).static) {
			throw new Error('@Watch decorator must be used on a instance method');
		}

		const metadata = context.metadata as DecoratorMetadata;
		if (!metadata) {
			throw new Error('no metadata');
		}
		if (context.kind !== 'method') {
			throw new Error('@Watch decorator must be used on a method');
		}

		// metadata.watchTarget = { watchKeys, target };
		const watchers = metadata.watchers || (metadata.watchers = new Set());
		watchers.add({ watchKeys, target });
	};
}
