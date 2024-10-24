import { DocumentFragmentVnode, ElementVnode, NodeType, TextVnode, Vnode } from './vnode';

export function isObject(target: unknown): target is object {
	return typeof target === 'object' && target !== null;
}

export function isElementNode(vnode: Vnode): vnode is ElementVnode {
	return vnode.type === NodeType.ELEMENT_NODE;
}

export function isTextNode(vnode: Vnode): vnode is TextVnode {
	return vnode.type === NodeType.TEXT_NODE;
}

export function isDcoumentFragmentNode(vnode: Vnode): vnode is DocumentFragmentVnode {
	return vnode.type === NodeType.DOCUMENT_FRAGMENT_NODE;
}

export function isDevelopment() {
	return process.env.NODE_ENV === 'development';
}
export function isElementEventListener(attrName: string) {
	return attrName.startsWith('on');
}
