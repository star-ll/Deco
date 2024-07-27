import { Component, Host, Prop, Ref, State, WebComponent } from '@deco/core';

const isObject = (target: unknown) => typeof target === 'object' && target !== null;

@Component({
	tag: 'test-reactive',
})
export class TestReactiveElement extends WebComponent {
	@State() data: any = 1;
	@State() age = 1;
	@State() person = {
		age: 1,
		zhangsan: {
			age: 1,
		},
	};

	render() {
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
export class TestPropElement extends WebComponent {
	@Prop() num = 1;

	@Ref() buttonEl?: any;
	@Host() host?: any;

	render() {
		console.log(1, this.host);

		return (
			<div>
				<div>
					<h3>prop</h3>
					<div>
						<i>prop is only allowed to be changed externally</i>
					</div>
					<div>loading: {this.num.toString()}</div>
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
								this.host.current.num++;
							}}
						>
							this.host.num++;
						</button>
						<button
							onClick={() => {
								this.host.current.setAttribute(
									'num',
									Number(this.host.current.getAttribute('num')) + 1,
								);
							}}
						>
							this.host.current.setAttribute('num', Number(this.host.current.getAttribute('num')) + 1);
						</button>
					</div>
				</div>
			</div>
		);
	}
}
