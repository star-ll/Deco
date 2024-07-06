import { Component, Prop, State } from '@deco/core/index';
import { WebComponent } from '../../../index';

@Component({ tag: 'm-button' })
export class Button extends WebComponent {
	@Prop() color!: string;

	render() {
		const { color } = this;
		return (
			<button style={{ color }}>
				<slot></slot>
			</button>
		);
	}
}

@Component({ tag: 'nested-component' })
export class nestedComponent extends WebComponent {
	@State() clickState = false;
	render() {
		const onClick = () => {
			this.clickState = !this.clickState;
			console.log('clickState', this.clickState);
		};

		return (
			<div>
				<h3>nested-component</h3>
				<button onClick={onClick}>change color of the right button</button>
				<m-button color={this.clickState ? 'red' : 'blue'}>button</m-button>
			</div>
		);
	}
}
