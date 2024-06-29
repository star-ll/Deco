import { DocumentFragmentVnode, ElementVnode, TextVnode, Vnode } from './vnode';
export declare function isElementNode(vnode: Vnode): vnode is ElementVnode;
export declare function isTextNode(vnode: Vnode): vnode is TextVnode;
export declare function isDcoumentFragmentNode(vnode: Vnode): vnode is DocumentFragmentVnode;
export declare function isDevelopment(): boolean;
//# sourceMappingURL=is.d.ts.map