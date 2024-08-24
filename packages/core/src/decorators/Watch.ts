import { DecoratorMetadata } from '../types';

//  todo： watchKeys param support ‘obj.s.a’
export default function Watch(watchKeys: any[] | never[]) {
	return function (target: Function, context: DecoratorMetadata) {
		const watchers = Reflect.getMetadata('watchers', target) || new Set();
		watchers.add({ watchKeys, target });
		Reflect.defineMetadata('watchers', watchers, target);
	};
}
