export interface Route {
	name: string;
	component: () => Promise<any>;
}

const routes: { [name: string]: Route } = {
	'/test': {
		name: 'test-demo',
		component: () => import('./test-demo.tsx'),
	},
};

export default routes;
