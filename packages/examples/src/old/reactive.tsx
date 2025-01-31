import { Component, Prop, Ref, State, DecoElement, Watch } from '@decoco/core';

const isObject = (target: unknown) => typeof target === 'object' && target !== null;

@Component({
	tag: 'test-reactive',
})
export class TestReactiveElement extends DecoElement {
	@State() data: any = 1;
	@State() age = 1;
	@State() person = {
		age: 1,
		zhangsan: {
			age: 1,
		},
	};

	render() {
		console.log('render');

		return (
			<div>
				<div>
					<h3>change state type</h3>
					<div>data = {isObject(this.data) ? JSON.stringify(this.data) : this.data.toString()}</div>
					<div>
						<button
							onClick={() => {
								if (isObject(this.data)) {
									this.data = 1;
								} else {
									this.data = { value: 1 };
								}
							}}
						>
							change data type
						</button>
						<button
							onClick={() => {
								if (isObject(this.data)) {
									(this.data as any).value++;
								} else {
									this.data++;
								}
							}}
						>
							change data value
						</button>
					</div>
				</div>
				<div>
					<h3>nested object</h3>
					<div>{JSON.stringify(this.person)}</div>
					<div>
						<button
							onClick={() => {
								this.person.age++;
								console.log(this.person);
							}}
						>
							this.person.age++
						</button>
						<button
							onClick={() => {
								this.person.zhangsan.age++;
							}}
						>
							this.person.zhangsan.age++
						</button>
					</div>
				</div>
				<div>
					<h3>mulit chnage state</h3>
					<div>age = {this.age}</div>
					<div>
						<button
							onClick={() => {
								this.age++;
								this.age++;
								this.age++;
							}}
						>
							this.age++; this.age++; this.age++;
						</button>
					</div>
				</div>
			</div>
		);
	}
}

@Component({
	tag: 'test-prop-reactive',
})
export class TestPropElement extends DecoElement {
	@Prop() num = 1;

	@Ref() buttonEl?: any;

	render() {
		return (
			<div>
				<div>
					<h3>prop</h3>
					<div>
						<i>prop is only allowed to be changed externally</i>
					</div>
					<div>num: {this.num.toString()}</div>
					<div>
						<button
							onClick={() => {
								this.num++;
							}}
						>
							this.num++;
						</button>
						<button
							onClick={() => {
								this.setAttribute('num', (Number(this.getAttribute('num') || '0') + 1).toString());
							}}
						>
							this.setAttribute('num', (Number(this.getAttribute('num') || '0') + 1).toString())
						</button>
					</div>
				</div>
			</div>
		);
	}
}

@Component('test-watch')
export class TestWatch extends DecoElement {
	@State()
	value = 1;

	@Watch(['value'])
	watchValue(val: number, oldValue: number, cleanup: () => void) {
		console.log('watch value', val, oldValue);
		// cleanup();
	}

	@Watch(['value'], { once: true })
	watchValueOnce(val: number, oldValue: number, cleanup: () => void) {
		console.log('watch once value', val, oldValue);
	}

	@Watch(['value'], { immediate: true })
	watchValueImmediate(val: number, oldValue: number, cleanup: () => void) {
		console.log('watch value, immediate run', val, oldValue);
	}

	render() {
		const onClick = () => {
			this.value++;
		};

		return (
			<>
				<div>
					<h3>prop</h3>
					<div>value: {this.value} (print in console)</div>
					<div>
						<button onClick={onClick}>+1</button>
					</div>
				</div>
			</>
		);
	}
}
