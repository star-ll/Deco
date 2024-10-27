import { jsxElementToVnode } from './vnode';

export function jsx(type: any, props: any = {}, ...children: any[]) {
	return jsxElementToVnode({
		type,
		props: { ...props, children },
		key: null,
	});
}
