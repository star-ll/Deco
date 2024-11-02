import { Component, DecoElement, State, Watch } from '@decoco/core';

@Component('test-watch-all')
export default class TestWatch extends DecoElement {
	@State() person = { name: 'Juk', children: [{ name: 'baby' }] };

	@Watch(['person', 'person.name', 'person.children[0]', 'person.children[0].name'])
	onPersonChange(value: any, oldValue: any) {
		console.log(value?.name || value, oldValue?.name || oldValue);
	}

	render() {
		const changeState = (type: string) => {
			switch (type) {
				case 'person':
					this.person = { name: 'Juk-change', children: [{ name: 'baby' }] };
					break;
				case 'person.name':
					this.person.name = 'Juk-change';
					break;
				case 'person.children[0]':
					this.person.children[0] = { name: 'baby-change' };
					break;
				case 'person.children[0].name':
					this.person.children[0].name = 'baby-change';
					break;
				default:
					break;
			}
		};

		return (
			<div>
				<h3>change watch</h3>
				<div>
					<button onClick={() => changeState('person')}>change this.person</button>
					<button onClick={() => changeState('person.name')}>change this.person.name</button>
					<button onClick={() => changeState('person.children[0]')}>change this.person.children[0]</button>
					<button onClick={() => changeState('person.children[0].name')}>
						change this.person.children[0].name
					</button>
				</div>
			</div>
		);
	}
}
