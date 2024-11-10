import { Component, DecoElement, EventEmitter, Event, State, Ref, RefType } from '@decoco/core';

@Component('emit-event')
export class EmitEvent extends DecoElement {
	@Event() emitter: EventEmitter;

	triggerEvent(eventName: string, successTip: string) {
		this.emitter!.emit(eventName, successTip);
	}
}

@Component('emit-event-test')
export class EmitEventTest extends DecoElement {
	@Ref() emitRef!: RefType<EmitEvent>;
	@Ref() emitRef2!: RefType<EmitEvent>;
	@Ref() emitRef3!: RefType<EmitEvent>;
	@Ref() emitRef4!: RefType<EmitEvent>;

	@State() text = '';
	render() {
		const onEvent = (e: CustomEvent) => {
			this.text = e.detail;
		};
		return (
			<div>
				<div className="result">{this.text}</div>
				<emit-event ref={this.emitRef} onTestEvent={onEvent}></emit-event>
				<emit-event ref={this.emitRef2} onTestEventCapture={onEvent}></emit-event>
				<emit-event ref={this.emitRef3} on-test-event={onEvent}></emit-event>
				<emit-event ref={this.emitRef4} on-test-event-capture={onEvent}></emit-event>
				<button onClick={() => this.emitRef.current!.triggerEvent('testevent', 'onTestEvent ok')}>
					onTestEvent
				</button>
				<button onClick={() => this.emitRef2.current!.triggerEvent('testevent', 'onTestEventCapture ok')}>
					onTestEventCapture
				</button>
				<button onClick={() => this.emitRef3.current!.triggerEvent('test-event', 'test-event ok')}>
					on-test-event
				</button>
				<button onClick={() => this.emitRef4.current!.triggerEvent('test-event', 'test-event-capture ok')}>
					on-test-event-capture
				</button>
			</div>
		);
	}
}
