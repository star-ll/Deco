import { Fragment } from './const';

const isVnode = Symbol.for('deco:isVnode');

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
	elm?: Node;
};
export type ElementVnode = baseVnode & {
	type: NodeType.ELEMENT_NODE;
	tag: string;
	props: { [key: string]: any };
	children: Vnode[];
	key?: string;
	elm?: Node;
};

export type DocumentFragmentVnode = baseVnode & {
	type: NodeType.DOCUMENT_FRAGMENT_NODE;
	children: Vnode[];
	key?: string;
	elm?: Node;
};

export type Vnode = ElementVnode | TextVnode | DocumentFragmentVnode;

export type JSXProps = {
	key?: string;
	children?: Vnode[];
	[key: string]: any;
};

export function jsxElementToVnode(element: JSX.Element): Vnode {
	if ((element as any)[isVnode]) {
		return element as Vnode;
	}
	if (typeof element === 'string' || typeof element === 'number') {
		return createTextVnode(element);
	} else if (element.type === Fragment) {
		return createFragmentVnode(element.props.children);
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
	return {
		type: NodeType.ELEMENT_NODE,
		tag,
		key,
		props: properties,
		children: (children as JSX.Element[]).map(jsxElementToVnode),
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
