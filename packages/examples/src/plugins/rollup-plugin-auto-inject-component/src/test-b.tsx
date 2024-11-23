import { Component, DecoElement } from '@decoco/core';

@Component('test-b')
export class TestA extends DecoElement {
	render() {
		return <div>test-b</div>;
	}
}
