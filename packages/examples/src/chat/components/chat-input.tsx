import { Component, DecoElement } from '@deco/core';

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
