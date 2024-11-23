import { Component, DecoElement } from '@decoco/core';

@Component('test-a')
export class TestA extends DecoElement {
	render() {
		return <div>test-a</div>;
	}
}

@Component('test-a-2')
export class TestA2 extends DecoElement {
	render() {
		return <div>test-a-two</div>;
	}
}
