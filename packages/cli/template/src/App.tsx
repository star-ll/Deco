import { DecoElement, Component } from '@decoco/core';

@Component('decoco-app')
export class DecocoApp extends DecoElement {
	render() {
		return (
			<div>
				<hello-world />
			</div>
		);
	}
}
