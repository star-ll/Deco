import { Component, DecoElement } from '@decoco/core';

@Component('chat-input')
export default class ChatInput extends DecoElement {
	render() {
		return (
			<div>
				<textarea rows={5}></textarea>
			</div>
		);
	}
}
