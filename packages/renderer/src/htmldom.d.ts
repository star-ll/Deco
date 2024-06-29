import { Vnode } from './vnode';
export declare function createNode(vnode: Vnode): Node;
export declare function removeNode(vnode: Vnode): Node | undefined;
export declare function createElement(tagName: string): HTMLElement;
export declare function createTextNode(text: string): Text;
export declare function createDocumentFragment(): DocumentFragment;
export declare function insertBefore(parent: HTMLElement, child: Node, before: Node): void;
export declare function appendChild(parent: HTMLElement, child: Node): void;
export declare function addNode(parent: HTMLElement, child: Node): void;
export declare function addNode(parent: HTMLElement, child: Node, before: Node): void;
export declare function removeElement(elm: HTMLElement): void;
//# sourceMappingURL=htmldom.d.ts.map