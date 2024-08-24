import { Component, Ref, DecoElement } from '@deco/core';

@Component({ tag: 'test-ref' })
export class TestRef extends DecoElement {
	@Ref() containerRef = { current: null };
	render() {
		const printnContainerRef = () => {
			console.log(this.containerRef);
		};
		const printHostElement = () => {
			console.log(this);
		};
		return (
			<>
				<h3>test ref and host</h3>
				<div ref={this.containerRef}>
					<button onClick={printnContainerRef}>console.log(this.containerRef)</button>
					<button onClick={printHostElement}>console.log(this)</button>
				</div>
			</>
		);
	}
}
