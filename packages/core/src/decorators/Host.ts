import { RefType } from '../types';

export default function Host(this: any) {
	return function (target: any, propertyKey: string) {
		// return function (this: any) {
		// 	return { current: this } as RefType<HTMLElement | undefined>;
		// };

		target[propertyKey] = { current: target } as RefType<HTMLElement>;
	};
}
