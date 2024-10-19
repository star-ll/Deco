import { Component, DecoElement, State } from '@decoco/core';

@Component('hello-world')
export class HelloWorld extends DecoElement {
	@State() count = 0;

	render() {
		return (
			<div>
				<h1>Hello World!</h1>
				<div>
					<section>count: {this.count}</section>
					<button onClick={() => this.count++}></button>
				</div>
			</div>
		);
	}
}
