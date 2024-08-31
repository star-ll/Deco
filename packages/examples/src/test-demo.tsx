import './src/reactive/index';
import './src/component/event';
import './src/render/nestedComponent';
import './src/render/ref';
import { DecoElement } from '@deco/core';

export class DemoTest extends DecoElement {
	render() {
		return (
			<>
				<test-reactive></test-reactive>
				<test-prop-reactive></test-prop-reactive>
				<test-event></test-event>
				<nested-component></nested-component>
				<test-ref></test-ref>
			</>
		);
	}
}
