import { Component, DecoElement, Ref, RefType, State } from '@decoco/core';

@Component('test-diff')
export default class TestDiff extends DecoElement {
	@Ref() container!: RefType<HTMLDivElement>;
	@State() arr = [1, 2, 3, 4, 5];

	componentDidMount(): void {
		for (let i = 0; i < this.container.current.children.length; i++) {
			const el = this.container.current.children[i];
			el.setAttribute('data-origin-item', this.arr[i].toString());
		}
	}
	render(): JSX.Element {
		const reset = () => {
			this.arr = [1, 2, 3, 4, 5];
			this.$nextTick(() => {
				for (let i = 0; i < this.container.current.children.length; i++) {
					const el = this.container.current.children[i];
					el.setAttribute('data-origin-item', this.arr[i].toString());
				}
			});
		};

		const simpleAddItemInStart = () => {
			this.arr = [-1, 0, 1, 2, 3, 4, 5];
		};

		const simpleAddItemInEnd = () => {
			this.arr = [1, 2, 3, 4, 5, 6, 7];
		};

		const simpleAddItemInMiddle = () => {
			this.arr.splice(2, 0, -1);
		};

		const simpleDeleteItemInStart = () => {
			this.arr.shift();
		};

		const simpleDeleteItemInEnd = () => {
			this.arr.pop();
		};

		const simpleDeleteInMiddle = () => {
			this.arr.splice(2, 1);
		};

		return (
			<div>
				<div ref={this.container} id="testContainer">
					{this.arr.map((item) => (
						<span key={item}>{item}</span>
					))}
				</div>
				<button onClick={reset}>reset</button>
				<button onClick={simpleAddItemInStart}>simpleAddItemInStart</button>
				<button onClick={simpleAddItemInEnd}>simpleAddItemInEnd</button>
				<button onClick={simpleAddItemInMiddle}>simpleAddItemInMiddle</button>
				<button onClick={simpleDeleteItemInStart}>simpleDeleteItemInStart</button>
				<button onClick={simpleDeleteItemInEnd}>simpleDeleteItemInEnd</button>
				<button onClick={simpleDeleteInMiddle}>simpleDeleteInMiddle</button>
			</div>
		);
	}
}
