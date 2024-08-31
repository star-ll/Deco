export default  {
    "/test": {
        name: 'test-reactive',
        component: () => import("./reactive/index.tsx")
    }
}