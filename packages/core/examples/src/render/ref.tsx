import { Component, Host, Ref, RefType } from '@deco/core/index';

@Component({ tag: 'test-ref' })
export class TestRef extends HTMLElement {
	@Ref() containerRef: RefType = { current: null };
	@Host() hostElement!: RefType;
	render() {
		const printnContainerRef = () => {
			console.log(this.containerRef);
		};
		const printHostElement = () => {
			console.log(this.hostElement);
		};
		return (
			<>
				<h3>test ref and host</h3>
				<div ref={this.containerRef}>
					<button onClick={printnContainerRef}>console.log(this.containerRef)</button>
					<button onClick={printHostElement}>console.log(this.hostElement)</button>
				</div>
			</>
		);
	}
}
