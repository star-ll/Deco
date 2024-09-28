import { Component, DecoElement } from '@decoco/core';

@Component()
export default class ChatInput extends DecoElement {
	render() {
		return (
			<div>
				<textarea rows={5}></textarea>
			</div>
		);
	}
}
