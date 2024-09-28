import { DecoElement, Component } from '@decoco/core';
import defineDecoComponents from 'virtual:decoco';

defineDecoComponents();

@Component()
export class DecoApp extends DecoElement {
	render() {
		return (
			<div>
				<hello-world />
			</div>
		);
	}
}
