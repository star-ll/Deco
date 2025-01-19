import { Component, DecoElement, globalStylesPlugin } from '@decoco/core';

DecoElement.use(globalStylesPlugin({ style: ':host { color: red; }' }));
@Component('test-global-style', { style: '.blue { color: blue; }' })
export default class GlobalStyleElement extends DecoElement {
	render() {
		return (
			<>
				<div>text color is red</div>
				<div className="blue">text color is blue</div>
			</>
		);
	}
}
