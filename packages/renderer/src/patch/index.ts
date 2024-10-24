import { addNode, createElement, createNode, createTextNode, removeNode } from '../htmldom';
import { isElementNode } from '../is';
import { DocumentFragmentVnode, ElementVnode, NodeType, TextVnode, type Vnode } from '../vnode';
import { patchProps } from './props';

export const vnodeFlag = Symbol.for('decoco:vnode');

interface Container extends HTMLElement {
	[vnodeFlag]: Vnode;
}

export function render(root: any, container: Container) {
	// console.log(root, container);
	// const root = jsxElementToVnode(jsxElement);
	// console.log('render', root);

	if (container[vnodeFlag]) {
		patchVnode(root, container[vnodeFlag]);
	} else {
		container.innerHTML = '';
		mountVnode(root, container);
	}

	container[vnodeFlag] = root;
}

export function mountVnode(vnode: Vnode, container: HTMLElement) {
	switch (vnode.type) {
		case NodeType.ELEMENT_NODE:
			mountElement(vnode, container);
			break;
		case NodeType.TEXT_NODE:
			mountText(vnode, container);
			break;
		// case NodeType.COMMENT_NODE:
		// 	mountComment(vnode, container);
		// 	break;
		case NodeType.DOCUMENT_FRAGMENT_NODE:
			mountDocumentFragment(vnode, container);
			break;
		// case NodeType.DOCUMENT_NODE:
		// 	mountDocument(vnode, container);
		// 	break;
		default:
			console.error(new Error('not support type:' + (vnode as any).type));
	}
}

function mountElement(vnode: ElementVnode, container: HTMLElement) {
	const elm = createElement(vnode.tag);
	vnode.elm = elm;
	vnode.children.forEach((child) => {
		mountVnode(child, elm);
	});

	addNode(container, elm);

	patchProps(elm, vnode.props, {});
	// mountRef(vnode.ref, el);
	// mountSlots(vnode.slots, el);
}

function mountText(vnode: TextVnode, container: HTMLElement) {
	const textNode = createTextNode(vnode.text);
	vnode.elm = textNode;
	addNode(container, textNode);
}

export function mountDocumentFragment(vnode: DocumentFragmentVnode, container: HTMLElement) {
	const fragment = createNode(vnode);
	// const fragment = document.createElement('div');
	vnode.elm = container;

	vnode.children.forEach((child) => {
		mountVnode(child, fragment as any);
	});

	addNode(container, fragment);
}

export function patchVnode(newVnode: Vnode, oldVnode: Vnode) {
	const elm = (newVnode.elm = oldVnode.elm) as HTMLElement;

	switch (oldVnode.type) {
		case NodeType.ELEMENT_NODE:
			patchElement(elm, oldVnode as ElementVnode, newVnode as ElementVnode);
			break;
		case NodeType.TEXT_NODE:
			patchText(oldVnode as TextVnode, newVnode as TextVnode);
			break;
		case NodeType.DOCUMENT_FRAGMENT_NODE:
			patchDocumentFragment(elm, oldVnode as DocumentFragmentVnode, newVnode as DocumentFragmentVnode);
			break;
		default:
			console.error(new Error('not support type'));
	}
}

function patchElement(parentElement: HTMLElement, oldVnode: ElementVnode, newVnode: ElementVnode) {
	if (oldVnode.tag !== newVnode.tag) {
		const newElm = createElement(newVnode.tag);
		newVnode.elm = newElm;
		addNode(oldVnode.elm!.parentElement!, newElm, oldVnode.elm!);
		removeNode(oldVnode);

		patchProps(newElm, newVnode.props, {});
	} else {
		const elm = (newVnode.elm = oldVnode.elm);
		patchProps(elm as HTMLElement, newVnode.props, oldVnode.props);
		updateChildren(elm as HTMLElement, newVnode.children, oldVnode.children);
	}
}

function patchText(oldVnode: TextVnode, newVnode: TextVnode) {
	const oldText = oldVnode.text;
	const newText = newVnode.text;
	if (oldText !== newText) {
		oldVnode.elm!.textContent = newText;
	}
	return newVnode;
}

export function patchDocumentFragment(
	parentElement: HTMLElement,
	oldVnode: DocumentFragmentVnode,
	newVnode: DocumentFragmentVnode,
) {
	if (oldVnode.elm !== newVnode.elm) {
		const newElm = createNode(newVnode);
		newVnode.elm = newElm;
		addNode(parentElement, newElm, oldVnode.elm!);
		removeNode(oldVnode);
	} else {
		const elm = (newVnode.elm = oldVnode.elm);
		updateChildren(elm!, newVnode.children, oldVnode.children);
	}
}

// export function patchComponent(parentElement: HTMLElement, oldVnode: ElementVnode, newVnode: ElementVnode) {
// 	if (oldVnode.tag !== newVnode.tag) {
// 		patchElement(parentElement, oldVnode, newVnode);
// 	} else {
// 		newVnode.elm = oldVnode.elm;
// 		(newVnode.elm as any)!.__updateComponent?.();
// 	}
// }

function sameVnode(oldVnode: Vnode, newVnode: Vnode) {
	return (
		// @ts-ignore
		oldVnode.type === newVnode.type && oldVnode.key === newVnode.key && oldVnode.tag === newVnode.tag
	);
}

function updateChildren(parentElement: HTMLElement | DocumentFragment, newChilren: Vnode[], oldChilren: Vnode[]) {
	let newStartIdx = 0;
	let oldStartIdx = 0;
	let newEndIdx = newChilren.length - 1;
	let oldEndIdx = oldChilren.length - 1;
	let oldKeyToIdx;
	let idxInOld;

	while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
		if (newChilren[newStartIdx] == null) {
			newStartIdx++;
		} else if (newChilren[newEndIdx] == null) {
			newEndIdx--;
		} else if (oldChilren[oldStartIdx] == null) {
			oldStartIdx++;
		} else if (oldChilren[oldEndIdx] == null) {
			oldEndIdx--;
		} else if (sameVnode(newChilren[newStartIdx], oldChilren[oldStartIdx])) {
			patchVnode(newChilren[newStartIdx++], oldChilren[oldStartIdx++]);
		} else if (sameVnode(newChilren[newEndIdx], oldChilren[oldEndIdx])) {
			patchVnode(newChilren[newEndIdx--], oldChilren[oldEndIdx--]);
		} else if (sameVnode(newChilren[newStartIdx], oldChilren[oldEndIdx])) {
			patchVnode(newChilren[newStartIdx], oldChilren[oldEndIdx]);
			addNode(parentElement, oldChilren[oldEndIdx].elm!, oldChilren[oldStartIdx].elm!);
			newStartIdx++;
			oldEndIdx--;
		} else if (sameVnode(newChilren[newEndIdx], oldChilren[oldStartIdx])) {
			patchVnode(newChilren[newEndIdx], oldChilren[oldStartIdx]);
			addNode(parentElement, oldChilren[oldStartIdx].elm!, oldChilren[oldEndIdx].elm!.nextSibling!);
			newEndIdx--;
			oldStartIdx++;
		} else {
			if (!oldKeyToIdx) {
				oldKeyToIdx = createKeyToOldIdx(oldChilren, oldStartIdx, oldEndIdx);
			}
			idxInOld = oldKeyToIdx[newChilren[newStartIdx].key!];
			if (idxInOld === undefined) {
				const elm = createNode(newChilren[newStartIdx], true);
				newChilren[newStartIdx].elm = elm;
				addNode(parentElement, elm, oldChilren[oldStartIdx].elm!);
				newStartIdx++;
			} else {
				if (sameVnode(oldChilren[idxInOld], newChilren[newStartIdx])) {
					patchVnode(newChilren[newStartIdx], oldChilren[idxInOld]);
					// @ts-ignore
					oldChilren[idxInOld] = undefined;
					addNode(parentElement, oldChilren[idxInOld].elm!, oldChilren[oldStartIdx].elm!);
				} else {
					const elm = createNode(newChilren[newStartIdx], true);
					newChilren[newStartIdx].elm = elm;
					addNode(parentElement, elm, oldChilren[oldStartIdx].elm!);
				}

				newStartIdx++;
			}
		}
	}

	for (let i = newStartIdx; i <= newEndIdx; i++) {
		const elm = createNode(newChilren[i], true);
		newChilren[i].elm = elm;
		addNode(parentElement, elm, oldChilren[oldStartIdx].elm!);
	}

	for (let i = oldStartIdx; i <= oldEndIdx; i++) {
		removeNode(oldChilren[i]);
	}
}

function createKeyToOldIdx(oldChilren: Vnode[], oldStartIdx: number, oldEndIdx: number) {
	const result: { [K in string]: number } = {};
	for (let i = oldStartIdx; i <= oldEndIdx; i++) {
		const vnode = oldChilren[i];
		if (isElementNode(vnode)) {
			const key = vnode.key;
			if (key) {
				result[key] = i;
			}
		}
	}
	return result;
}
