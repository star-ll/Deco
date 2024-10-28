import { Component, DecoElement } from '@decoco/core';

@Component('test-lifecycle')
export default class TestLifecycle extends DecoElement {
	updateCount = 0;

	constructor() {
		super();

		console.log('constructor');
	}

	componentWillMount() {
		console.log('componentWillMount');
	}

	componentDidMount() {
		console.log('componentDidMount');
	}

	shouldComponentUpdate() {
		console.log('shouldComponentUpdate');

		return true;
	}

	componentDidUpdate() {
		console.log('componentDidUpdate');
	}

	render() {
		this.updateCount++;
		return <div id="testLifeCycle">updateCount={this.updateCount}</div>;
	}
}
