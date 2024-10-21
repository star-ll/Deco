import { isDcoumentFragmentNode, isElementNode, isTextNode } from './is';
import { DocumentFragmentVnode, ElementVnode, NodeType, TextVnode, Vnode } from './vnode';

export function createNode(vnode: ElementVnode, isDeep?: boolean): HTMLElement;
export function createNode(vnode: TextVnode): Text;
export function createNode(vnode: DocumentFragmentVnode, isDeep?: boolean): DocumentFragment;
export function createNode(vnode: Vnode, isDeep?: boolean): HTMLElement;
export function createNode(vnode: Vnode, isDeep = false) {
	let elm;
	if (isElementNode(vnode)) {
		elm = createElement(vnode.tag);
	} else if (isTextNode(vnode)) {
		elm = createTextNode(vnode.text);
	} else if (isDcoumentFragmentNode(vnode)) {
		elm = createDocumentFragment();
	} else {
		throw new Error('unsupported vnode type');
	}

	vnode.elm = elm;

	if (isDeep && !isTextNode(vnode)) {
		vnode.children.forEach((child) => {
			let node;
			if (isTextNode(child)) {
				createNode(child);
			} else {
				createNode(child as ElementVnode, isDeep);
			}
			child.elm = elm;
			addNode(elm as HTMLElement, node!);
		});
	}

	return elm;
}
export function removeNode(vnode: Vnode) {
	return vnode.elm!.parentNode?.removeChild(vnode.elm!);
}

export function createElement(tagName: string) {
	return document.createElement(tagName);
}
export function createTextNode(text: string) {
	const textNode = document.createTextNode('');
	textNode.textContent = text;
	return textNode;
}
export function createDocumentFragment() {
	return document.createDocumentFragment();
}

export function insertBefore(parent: HTMLElement | DocumentFragment, child: Node, before: Node) {
	parent.insertBefore(child, before);
}

export function appendChild(parent: HTMLElement | DocumentFragment, child: Node) {
	parent.appendChild(child);
}

export function addNode(parent: HTMLElement | DocumentFragment, child: Node): void;
export function addNode(parent: HTMLElement | DocumentFragment, child: Node, before: Node): void;
export function addNode(parent: HTMLElement | DocumentFragment, child: Node, before?: Node): void {
	if (before) {
		insertBefore(parent, child, before);
	} else {
		appendChild(parent, child);
	}
}
export function removeElement(elm: HTMLElement) {
	elm.remove();
}
