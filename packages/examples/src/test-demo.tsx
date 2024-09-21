import { DecoElement, Component } from '@deco/core';

import './reactive';
import './event';
import './nestedComponent';
import './ref';

class GlobalStyle {
	apply() {}
}

DecoElement.use(new GlobalStyle());

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
