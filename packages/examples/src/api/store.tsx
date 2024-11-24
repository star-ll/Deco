import { configureStore, createSlice } from '@reduxjs/toolkit';
import { DecoElement, Component, Store } from '@decoco/core';

const testSlice = createSlice({
	name: 'test',
	initialState: {
		count: 0,
		deepObject: { name: 'out', obj: { name: 'inner' } },
	},
	reducers: {
		increment: (state) => {
			state.count += 1;
		},
	},
});

type RootState = ReturnType<typeof store.getState>;
const store = configureStore({ reducer: { test: testSlice.reducer } });
const { increment } = testSlice.actions;

function incrementCount() {
	store.dispatch(increment());
}

@Component('test-base-store')
export class TestBaseStore extends DecoElement {
	@Store(store, (state: RootState) => state.test) store!: RootState['test'];

	componentDidMount(): void {
		incrementCount();
	}

	render(): JSX.Element | void {
		const { dispatch } = store;

		const incrementCount = () => {
			dispatch(increment());
		};

		return (
			<div>
				<div>parent count:{this.store.count}</div>
				<div>
					<test-base-store-child />
				</div>
				<div>
					<button onClick={incrementCount}>changeCountFromParent</button>
				</div>
			</div>
		);
	}
}

@Component('test-base-store-child')
export class TestBaseStoreChild extends DecoElement {
	@Store(store, (state: RootState) => state.test) store!: RootState['test'];

	render(): JSX.Element | void {
		const { dispatch } = store;

		const incrementCount = () => {
			dispatch(increment());
		};
		return (
			<div>
				<div>child count:{this.store.count}</div>
				<div>
					<button onClick={incrementCount}>changeCountFromChild</button>
				</div>
			</div>
		);
	}
}
