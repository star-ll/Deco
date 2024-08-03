import { RefType } from '../types';

export default function Host() {
	return function (target: unknown, context: any) {
		if (context.static) {
			throw new Error('@Host can not be used in static context');
		}

		return function (this: any) {
			return { current: this } as RefType<HTMLElement | undefined>;
		};
	};
}
