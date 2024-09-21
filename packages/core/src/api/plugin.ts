import { DecoBaseElement } from './base';

export type DecoPluginType = {
	apply: () => void;
};

export class DecoPlugin extends DecoBaseElement {
	private static plugins: DecoPluginType[] = [];

	static use(plugin: DecoPluginType) {
		DecoPlugin.plugins.push(plugin);
		return this;
	}

	getPlugins() {
		return DecoPlugin.plugins;
	}
}
