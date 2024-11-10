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
	'/renderer/jsx': {
		name: 'test-jsx',
		component: () => import('./renderer/jsx'),
	},
	'/lifecycycle': {
		name: 'test-lifecycle',
		component: () => import('./lifecycle/test-lifecycle'),
	},
	'/api/watch': {
		name: 'test-watch-all',
		component: () => import('./api/watch'),
	},
	'/api/prop': {
		name: 'test-prop',
		component: () => import('./api/prop'),
	},
};

export default routes;
