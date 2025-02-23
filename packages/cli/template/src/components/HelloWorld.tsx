import { Component, DecoElement, State, Prop } from '@decoco/core';

interface HelloWorldProps {
	message: string;
}

@Component('hello-world')
export class HelloWorld extends DecoElement<HelloWorldProps> {
	@Prop() message!: HelloWorldProps['message'];
	@State() count = 0;

	render() {
		return (
			<div>
				<h1>{this.message}</h1>
				<div>
					<section>count: {this.count}</section>
					<button onClick={() => this.count++}>+1</button>
				</div>
			</div>
		);
	}
}
