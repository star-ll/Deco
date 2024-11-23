import { DecoElement, Component } from '@decoco/core';
import 'virtual:decoco';

@Component('test-auto-inject-plugin')
export default class TestAutoInjectPlugin extends DecoElement {
	render() {
		return (
			<div>
				<test-a></test-a>
				<test-a-2></test-a-2>
				<test-b></test-b>
			</div>
		);
	}
}
