import { DecoBaseElement } from './base';
import { DecoPluginType } from '../types';

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
