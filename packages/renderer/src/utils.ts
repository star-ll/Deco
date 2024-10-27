export function mapTree(nodes: any[], callback: Function, parent: any = null) {
	return nodes?.map((node: any, index: number) => {
		callback(node, index, parent);
		node.children = mapTree(node.children, callback, node);
		return node;
	});
}

export function callFn(this: unknown, fn: Function, erorr: string | Error, ...args: any[]) {
	try {
		return fn.call(this, ...args);
	} catch (err) {
		console.error(err);
		console.error(erorr);
	}
}
