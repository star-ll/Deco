export type EffectOptions = {
	value?: any;
	oldValue?: any;
	clear?: Function;
};
export type EffectTarget = ((value: unknown, oldValue?: unknown, clear?: Function) => any) | Function;

let uid = 1;

export class Effect {
	static target: any | null = null;

	id = uid++;
	#effect: EffectTarget = (...args: any[]) => {};
	#options: EffectOptions = {};

	constructor(effect?: EffectTarget | Function, options: EffectOptions = {}) {
		this.#effect = effect || this.#effect;
		this.#options = options || this.#options;
	}

	run() {
		const { value, oldValue, clear } = this.#options;
		this.#effect(value, oldValue, clear);
	}
	setOption(options: EffectOptions) {
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
