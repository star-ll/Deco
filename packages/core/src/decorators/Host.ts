import { DecoratorMetadata, RefType } from '../types';

export default function Host() {
	return function (target: any, context: any) {
		if (context.static) {
			throw new Error('@Host can not be used in static context');
		}

		const metadata: DecoratorMetadata = context.metadata;

		return function (this: any) {
			return { current: this } as RefType<HTMLElement>;
		};
	};
}
