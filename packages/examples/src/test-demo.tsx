import { DecoElement, Component } from '@deco/core';

import './reactive/index';
import './component/event';
import './render/nestedComponent';
import './render/ref';

@Component()
export class TestDemo extends DecoElement {
	render() {
		return (
			<>
				<test-reactive></test-reactive>
				<test-prop-reactive></test-prop-reactive>
				<test-event></test-event>
				<nested-component></nested-component>
				<test-ref></test-ref>
				<test-watch></test-watch>
			</>
		);
	}
}
