import { browser } from '$app/environment';

const channel = 'pkhex-web-bridge';
const bridgeUrl = (import.meta.env.PUBLIC_PKHEX_BRIDGE_URL as string | undefined) ?? 'http://localhost:5062/bridge';

type BridgeEnvelope = {
	channel: string;
	type: 'ready' | 'response';
	requestId?: string;
	success?: boolean;
	data?: unknown;
	error?: string;
};

type PendingRequest = {
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
};

export type BridgeQuickAction = {
	pluginId: string;
	hookType: string;
	label: string;
	description: string;
	disabled: boolean;
	reason?: string | null;
};

export type PokemonSummary = {
	uniqueId: string;
	species: string;
	nickname: string;
	displayName: string;
	level: number;
	shiny: boolean;
	gender: string;
	heldItem: string;
	ability: string;
	form: string;
};

export type PokemonCollection = {
	source: 'party' | 'box';
	entries: PokemonSummary[];
	showdown: string;
};

export type PokemonStats = {
	hp: number;
	atk: number;
	def: number;
	spa: number;
	spd: number;
	spe: number;
};

export type PokemonDetails = {
	source: 'party' | 'box';
	pokemon: PokemonSummary & {
		friendship: number;
		gameVersion: string;
		nature: string;
		showdown: string;
		moves: Array<{ slot: string; name: string; pp: number; maxPp: number }>;
		stats: PokemonStats;
		evs: PokemonStats;
		ivs: PokemonStats;
	};
};

export type ItemEntry = {
	id: number;
	name: string;
	count: number;
};

export type InventorySnapshot = {
	type: string;
	maxItemCountAllowed: number;
	items: ItemEntry[];
};

export type ItemsSnapshot = {
	inventoryTypes: string[];
	inventories: InventorySnapshot[];
};

export type PluginFailure = {
	pluginId: string;
	message: string;
	stackTrace?: string | null;
};

export type BridgeSnapshot = {
	loaded: boolean;
	fileName?: string | null;
	gameVersion?: string | null;
	trainer?: {
		id: string;
		name: string;
		rivalName?: string | null;
		money: number;
		gender: string;
		genderSymbol: string;
	} | null;
	quickActions: BridgeQuickAction[];
};

export type PluginSummary = {
	id: string;
	name: string;
	description?: string | null;
	version: string;
	enabled: boolean;
	hasNewerVersion: boolean;
	projectUrl?: string | null;
	publicKeyToken?: string | null;
	sourceId: string;
	information?: string | null;
};

export type AvailablePlugin = {
	sourceUrl: string;
	sourceName: string;
	id: string;
	name: string;
	description?: string | null;
	projectUrl: string;
	version?: string | null;
	downloadUrl: string;
};

export type PluginSetting =
	| { key: string; kind: 'string'; value: string; readOnly: boolean }
	| { key: string; kind: 'boolean'; value: boolean; readOnly: boolean }
	| { key: string; kind: 'integer'; value: number; readOnly: boolean }
	| { key: string; kind: 'file'; fileName?: string | null; hasFile: boolean; readOnly: boolean }
	| { key: string; kind: 'unknown' };

export type PluginHook = {
	type: string;
	name: string;
	description: string;
	kind: string;
	enabled: boolean;
};

export type PluginDetails = {
	plugin: PluginSummary;
	hooks: PluginHook[];
	settings: PluginSetting[];
};

export type PluginListResult = {
	installed: PluginSummary[];
	available: AvailablePlugin[];
};

export type QuickActionResult =
	| { type: 'none' }
	| {
			type: 'notification';
			notification: { message: string; description?: string | null; severity: string };
	  }
	| {
			type: 'pluginPage';
			pluginPage: { pluginId: string; path: string; layout: string; title: string };
	  };

class BridgeClient {
	readonly url = bridgeUrl;

	#frame: HTMLIFrameElement | null = null;
	#requestId = 0;
	#pending = new Map<string, PendingRequest>();
	#ready = false;
	#readyWaiters: Array<() => void> = [];
	#listenerAttached = false;

	constructor() {
		if (browser) {
			this.#attachListener();
		}
	}

	setFrame(frame: HTMLIFrameElement | null) {
		this.#frame = frame;
		if (frame && browser) {
			this.#attachListener();
		}
	}

	async ensureReady() {
		if (this.#ready) return;
		await new Promise<void>((resolve) => {
			this.#readyWaiters.push(resolve);
		});
	}

	async getState() {
		return (await this.#request('getState')) as BridgeSnapshot;
	}

	async loadSave(fileName: string, base64: string) {
		const snapshot = (await this.#request('loadSave', { fileName, base64 })) as BridgeSnapshot;
		this.#emitStateChanged();
		return snapshot;
	}

	async updateTrainer(payload: { money: number; gender: string }) {
		const snapshot = (await this.#request('updateTrainer', payload)) as BridgeSnapshot;
		this.#emitStateChanged();
		return snapshot;
	}

	async exportSave() {
		return (await this.#request('exportSave')) as { fileName: string; base64: string };
	}

	async getCollection(source: 'party' | 'box') {
		return (await this.#request('getCollection', { source })) as PokemonCollection;
	}

	async getPokemon(source: 'party' | 'box', uniqueId: string) {
		return (await this.#request('getPokemon', { source, uniqueId })) as PokemonDetails;
	}

	async exportPokemon(uniqueId: string) {
		return (await this.#request('exportPokemon', { uniqueId })) as { fileName: string; base64: string };
	}

	async getItems() {
		return (await this.#request('getItems')) as ItemsSnapshot;
	}

	async setItemCount(inventoryType: string, itemId: number, count: number) {
		return (await this.#request('setItemCount', { inventoryType, itemId, count })) as ItemsSnapshot;
	}

	async getPluginFailures() {
		return (await this.#request('getPluginFailures')) as { failures: PluginFailure[] };
	}

	async getPlugins() {
		return (await this.#request('getPlugins')) as PluginListResult;
	}

	async getPlugin(pluginId: string) {
		return (await this.#request('getPlugin', { pluginId })) as PluginDetails;
	}

	async installPlugin(sourceUrl: string, downloadUrl: string) {
		return (await this.#request('installPlugin', { sourceUrl, downloadUrl })) as PluginListResult;
	}

	async uninstallPlugin(pluginId: string) {
		return (await this.#request('uninstallPlugin', { pluginId })) as PluginListResult;
	}

	async updatePlugin(pluginId: string) {
		return (await this.#request('updatePlugin', { pluginId })) as PluginDetails;
	}

	async setPluginEnabled(pluginId: string, enabled: boolean) {
		return (await this.#request('setPluginEnabled', { pluginId, enabled })) as PluginDetails;
	}

	async setHookEnabled(pluginId: string, hookType: string, enabled: boolean) {
		return (await this.#request('setHookEnabled', { pluginId, hookType, enabled })) as PluginDetails;
	}

	async setPluginSetting(payload: {
		pluginId: string;
		key: string;
		kind: 'string' | 'boolean' | 'integer' | 'file';
		value?: string | boolean | number;
		fileName?: string;
		base64?: string;
	}) {
		return (await this.#request('setPluginSetting', payload)) as PluginDetails;
	}

	async runQuickAction(pluginId: string, hookType: string) {
		return (await this.#request('runQuickAction', { pluginId, hookType })) as QuickActionResult;
	}

	async showPluginPage(pluginId: string, path: string) {
		return (await this.#request('showPluginPage', { pluginId, path })) as { shown: boolean; layout: string };
	}

	async clearPluginPage() {
		return (await this.#request('clearPluginPage')) as { cleared: boolean };
	}

	#emitStateChanged() {
		if (!browser) return;
		window.dispatchEvent(new CustomEvent('pkhex:state-changed'));
	}

	bytesToBase64(bytes: Uint8Array) {
		let binary = '';
		const chunk = 0x8000;
		for (let index = 0; index < bytes.length; index += chunk) {
			binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
		}
		return btoa(binary);
	}

	async fileToBase64(file: File) {
		const bytes = new Uint8Array(await file.arrayBuffer());
		return this.bytesToBase64(bytes);
	}

	downloadBase64File(base64: string, fileName: string) {
		const link = document.createElement('a');
		link.href = `data:application/octet-stream;base64,${base64}`;
		link.download = fileName;
		link.click();
		link.remove();
	}

	#attachListener() {
		if (this.#listenerAttached) return;
		window.addEventListener('message', (event: MessageEvent<BridgeEnvelope>) => {
			const data = event.data;
			if (!data || data.channel !== channel) return;

			if (data.type === 'ready') {
				this.#ready = true;
				for (const resolve of this.#readyWaiters.splice(0)) {
					resolve();
				}
				return;
			}

			if (data.type !== 'response' || !data.requestId) return;

			const pending = this.#pending.get(data.requestId);
			if (!pending) return;

			this.#pending.delete(data.requestId);
			if (data.success) {
				pending.resolve(data.data);
				return;
			}

			pending.reject(new Error(data.error ?? 'Bridge request failed.'));
		});
		this.#listenerAttached = true;
	}

	async #request(command: string, payload: Record<string, unknown> = {}) {
		await this.ensureReady();
		const frameWindow = this.#frame?.contentWindow;
		if (!frameWindow) {
			throw new Error('Bridge iframe is not connected.');
		}

		const requestId = `${command}-${this.#requestId++}`;
		const promise = new Promise<unknown>((resolve, reject) => {
			this.#pending.set(requestId, { resolve, reject });
		});

		frameWindow.postMessage({ channel, type: 'request', requestId, command, payload }, '*');
		return promise;
	}
}

export const bridgeClient = new BridgeClient();
