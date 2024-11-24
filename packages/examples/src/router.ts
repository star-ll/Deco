export interface Route {
	name?: string;
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
	'/renderer/event': {
		name: 'emit-event-test',
		component: () => import('./renderer/event'),
	},
	'/renderer/jsx': {
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
	'/api/store': {
		name: 'test-base-store',
		component: () => import('./api/store'),
	},
	'/plugins/auto-inject': {
		name: 'test-auto-inject-plugin',
		component: () => import('./plugins/rollup-plugin-auto-inject-component/index'),
	},
};

export default routes;
