/// <reference types="react" />
declare const isVnode: unique symbol;
export declare enum NodeType {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9,
    DOCUMENT_FRAGMENT_NODE = 11
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
    props: {
        [key: string]: any;
    };
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
export declare function jsxElementToVnode(element: JSX.Element): Vnode;
export declare function createTextVnode(text: string): TextVnode;
export declare function createElementVnode(tag: string, props: JSXProps): ElementVnode;
export declare function createFragmentVnode(children: Vnode[]): DocumentFragmentVnode;
export {};
//# sourceMappingURL=vnode.d.ts.map