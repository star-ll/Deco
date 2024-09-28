import { DecoElement, Component } from '@deco/core';
import defineDecoComponents from 'virtual:deco';

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
