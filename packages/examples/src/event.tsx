import { Component, Event, Listen, type EventEmitter, DecoElement } from '@decoco/core';

@Component({
	tag: 'test-event',
})
export class TestEvent extends DecoElement {
	@Listen('test-event')
	listenTestEvent(e: Event) {
		console.log('listen test event', e);
	}

	render() {
		return (
			<div>
				<h3>emit and listen event</h3>
				<test-event-emit onTestEvent={(e: any) => console.log(e.detail)}></test-event-emit>
			</div>
		);
	}
}

@Component({
	tag: 'test-event-emit',
})
export class TestEventEmit extends DecoElement {
	@Event() event: EventEmitter;

	render() {
		const emitEvent = () => {
			console.log('emit event', this.event);

			this.event!.emit('test-event', 'test');
		};

		return (
			<div>
				<div>
					<button onClick={emitEvent}>emit event</button>
				</div>
			</div>
		);
	}
}
