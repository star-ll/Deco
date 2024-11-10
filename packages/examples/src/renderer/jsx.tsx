import { Component, DecoElement, State } from '@decoco/core';

@Component('test-jsx-logic-with')
export class TestJsxLogicWith extends DecoElement {
	@State() isShow = false;

	render() {
		return (
			<div>
				<button onClick={() => (this.isShow = !this.isShow)}>change show state</button>
				<div className="result">{this.isShow && <div>show</div>}</div>
			</div>
		);
	}
}

@Component('test-jsx-trinomial')
export class TestJsxTrinomial extends DecoElement {
	@State() isShow = false;

	render() {
		return (
			<div>
				<button onClick={() => (this.isShow = !this.isShow)}>change show state</button>
				<div className="result">{this.isShow ? <input className="a" /> : <div id={'b'}>hidden</div>}</div>
			</div>
		);
	}
}
