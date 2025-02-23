import { DecoElement, Component } from '@decoco/core';
import { HelloWorld } from './components/HelloWorld';

@Component('decoco-app')
export class DecocoApp extends DecoElement {
	render() {
		return (
			<div>
				<HelloWorld message={'Hello World!'} />
			</div>
		);
	}
}
