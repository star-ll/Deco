import { Component, DecoElement, Computed, State } from '@decoco/core';

@Component('test-computed')
export class ComputedTest extends DecoElement {
	@State()
	state = {
		value: 0,
	};

	@State()
	list: { id: number; value: string }[] = [];

	@Computed()
	get computedValue() {
		const global = window as any;
		global.computeCount = (global.computeCount || 0) + 1; // record computed execute count

		const result = this.list.find((i) => i.id === this.state.value)?.value || `value is ${this.state.value}`;
		return result;
	}
	set computedValue(value: string) {
		console.log('set computedValue', value);
		this.state.value = Number(value);
	}

	constructor() {
		super();

		setTimeout(() => {
			this.list = new Array(10).fill(0).map((_, index) => ({ id: index, value: 'list index is ' + index }));
		}, 1000);
	}

	render() {
		const getComputedValue = () => {
			console.log('computedValue=' + this.computedValue);
		};
		return (
			<div>
				<div>computedValue: {this.computedValue}</div>
				<div>state.value: {this.state.value}</div>
				<button onClick={() => this.state.value++}>state.value++</button>
				<button onClick={getComputedValue}>getComputedValue</button>
				<button onClick={() => (this.computedValue = String(this.state.value + 1))}>
					change computedValue
				</button>
			</div>
		);
	}
}
