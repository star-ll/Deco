import { DocumentFragmentVnode, type Vnode } from '../vnode';
export declare const vnodeFlag: unique symbol;
interface Container extends HTMLElement {
    [vnodeFlag]: Vnode;
}
export declare function render(root: any, container: Container): void;
export declare function mountVnode(vnode: Vnode, container: HTMLElement): void;
export declare function mountDocumentFragment(vnode: DocumentFragmentVnode, container: HTMLElement): void;
export declare function patchVnode(oldVnode: Vnode, newVnode: Vnode): void;
export declare function patchDocumentFragment(parentElement: HTMLElement, oldVnode: DocumentFragmentVnode, newVnode: DocumentFragmentVnode): void;
export {};
//# sourceMappingURL=index.d.ts.map