// import './src/reactive/index';
// import './src/component/event';
// import './src/render/nestedComponent';
// import './src/render/ref';

import routes from './src/router';

function handlerRouter(route) {
	if (!route) {
		document.write('404');
	}

	route.component().then(() => {
		const component = document.createElement(route.name);
		document.body.innerHTML = '';
		document.body.appendChild(component);
	});
}
window.addEventListener('hashchange', function (e) {
	const url = new URL(e.newURL);
	const hashURL = url.hash.slice(1);
	const route = routes[hashURL];
	handlerRouter(route);
});

if (location.hash === '') {
	location.assign(location.origin + '/#/test');
} else {
	handlerRouter(routes[location.hash.slice(1)]);
}
