export type DepEffectOptions = {
	value?: any;
	oldValue?: any;
	clear?: Function;
};
export type DepEffect = ((value: unknown, oldValue?: unknown, clear?: Function) => any) | Function;

let uid = 1;

export class Dep {
	static target: any | null = null;

	id = uid++;
	#effect: DepEffect = (...args: any[]) => {};
	#options: DepEffectOptions = {};

	constructor(effect?: DepEffect | Function, options: DepEffectOptions = {}) {
		this.#effect = effect || this.#effect;
		this.#options = options || this.#options;
	}

	run() {
		const { value, oldValue, clear } = this.#options;
		this.#effect(value, oldValue, clear);
	}
	setOption(options: DepEffectOptions) {
		this.#options = options;
	}
	getOption() {
		return this.#options;
	}
	setEffect(effect: any) {
		this.#effect = effect;
	}
	getEffect() {
		return this.#effect;
	}
}
