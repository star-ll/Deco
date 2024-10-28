export interface Route {
	name: string;
	component: () => Promise<any>;
}

const routes: { [name: string]: Route } = {
	'/test': {
		name: 'test-demo',
		component: () => import('./old/test-demo'),
	},
	'/renderer/diff': {
		name: 'test-diff',
		component: () => import('./renderer/test-diff'),
	},
};

export default routes;
