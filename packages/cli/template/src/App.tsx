import { DecoElement, Component } from '@decoco/core';

@Component()
export class DecocoApp extends DecoElement {
	render() {
		return (
			<div>
				<hello-world />
			</div>
		);
	}
}
