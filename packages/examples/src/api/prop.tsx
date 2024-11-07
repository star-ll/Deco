import { Component, DecoElement, Prop } from '@decoco/core';

@Component('test-prop')
export default class TestProp extends DecoElement {
	@Prop() name?: string;
	@Prop() count = 1;
	render() {
		return (
			<div id="test-prop">
				<div>name: {this.name}</div>
				<div>count: {this.count}</div>
			</div>
		);
	}
}
