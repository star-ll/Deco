import { Fragment } from './const';
import { isObject } from './is';

const isVnode = Symbol.for('decoco:isVnode');

export enum NodeType {
	ELEMENT_NODE = 1,
	TEXT_NODE = 3,
	COMMENT_NODE = 8,
	DOCUMENT_NODE = 9,
	DOCUMENT_FRAGMENT_NODE = 11,
}
export type baseVnode = {
	[isVnode]: true;
};
export type TextVnode = baseVnode & {
	type: NodeType.TEXT_NODE;
	text: string;
	key: undefined;
	elm?: Text;
};
export type ElementVnode = baseVnode & {
	type: NodeType.ELEMENT_NODE;
	tag: string;
	props: { [key: string]: any };
	children: Vnode[];
	key?: string;
	elm?: HTMLElement;
};

export type DocumentFragmentVnode = baseVnode & {
	type: NodeType.DOCUMENT_FRAGMENT_NODE;
	children: Vnode[];
	key?: string;
	elm?: DocumentFragment | HTMLElement;
};

export type Vnode = ElementVnode | TextVnode | DocumentFragmentVnode;

export type JSXProps = {
	key?: string;
	children?: Vnode[];
	[key: string]: any;
};

export function jsxElementToVnode(element: JSX.Element | JSX.Element[] | string | number): Vnode | Vnode[] {
	if (Array.isArray(element)) {
		const vnodeList: Vnode[] = [];
		element.forEach((jsxElement) => {
			const vnode = jsxElementToVnode(jsxElement);
			if (Array.isArray(vnode)) {
				vnodeList.push(...vnode);
			} else {
				vnodeList.push(vnode);
			}
		});
		return vnodeList;
	} else if (!isObject(element)) {
		return typeof element === 'string' || typeof element === 'number' ? createTextVnode(String(element)) : [];
	} else if ((element as any)[isVnode]) {
		return element as Vnode;
	} else if (element.type === Fragment) {
		// return createFragmentVnode(element.props.children);
		return jsxElementToVnode(element.props.children);
	} else if (element.type) {
		return createElementVnode(element.type, element.props);
	} else {
		console.error(new Error(`jsxElementToVnode: <${element.type}> is unknown element type`));
		return createTextVnode(''); // TODO: handle error element type
	}
}

export function createTextVnode(text: string): TextVnode {
	return {
		type: NodeType.TEXT_NODE,
		text: text.toString(),
		key: undefined,
		elm: undefined,
		[isVnode]: true,
	};
}

export function createElementVnode(tag: string, props: JSXProps): ElementVnode {
	const { key, children = [], ...properties } = props || {};

	const childrenVnode: Vnode[] = [];
	(children as JSX.Element[]).forEach((jsxElement) => {
		const vnode = jsxElementToVnode(jsxElement);
		if (Array.isArray(vnode)) {
			childrenVnode.push(...vnode);
		} else {
			childrenVnode.push(vnode);
		}
	});

	return {
		type: NodeType.ELEMENT_NODE,
		tag,
		key,
		props: properties,
		children: childrenVnode,
		elm: undefined,
		[isVnode]: true,
	};
}

export function createFragmentVnode(children: Vnode[]): DocumentFragmentVnode {
	return {
		type: NodeType.DOCUMENT_FRAGMENT_NODE,
		children,
		elm: undefined,
		[isVnode]: true,
	};
}
