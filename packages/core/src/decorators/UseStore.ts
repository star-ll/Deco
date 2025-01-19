export default function UseStore(store: any, getState: (state: any) => any) {
	return function (target: any, propertyName: string) {
		const storeMap = Reflect.getMetadata('stores', target) || new Map();
		storeMap.set(propertyName, { store, getState });
		Reflect.defineMetadata('stores', storeMap, target);
	};
}
