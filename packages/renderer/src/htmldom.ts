import { isDcoumentFragmentNode, isElementNode, isTextNode } from './is';
import { NodeType, Vnode } from './vnode';

export function createNode(vnode: Vnode): Node {
	if (isElementNode(vnode)) {
		return createElement(vnode.tag);
	} else if (isTextNode(vnode)) {
		return createTextNode(vnode.text);
	} else if (isDcoumentFragmentNode(vnode)) {
		return createDocumentFragment();
	} else {
		throw new Error('unsupported vnode type');
	}
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

export function insertBefore(parent: HTMLElement, child: Node, before: Node) {
	parent.insertBefore(child, before);
}

export function appendChild(parent: HTMLElement, child: Node) {
	parent.appendChild(child);
}

export function addNode(parent: HTMLElement, child: Node): void;
export function addNode(parent: HTMLElement, child: Node, before: Node): void;
export function addNode(parent: HTMLElement, child: Node, before?: Node): void {
	if (before) {
		insertBefore(parent, child, before);
	} else {
		appendChild(parent, child);
	}
}
export function removeElement(elm: HTMLElement) {
	elm.remove();
}
