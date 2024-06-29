import { Component, Event, Listen, type EventEmitter } from '../../../src/decorators';

@Component({
	tag: 'test-event',
})
export class TestEvent extends HTMLElement {
	@Listen('test-event')
	listenTestEvent(e: CustomEvent) {
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
export class TestEventEmit extends HTMLElement {
	@Event() event: EventEmitter;

	render() {
		const emitEvent = () => {
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
