import { jsxElementToVnode } from './vnode';

export function jsx(type: any, props: any = {}, ...children: any[]) {
	// console.log('h', type, props, children);
	return jsxElementToVnode({
		type,
		props: { ...props, children },
		key: null,
	});
}
