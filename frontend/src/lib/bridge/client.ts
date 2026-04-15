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
	timeout: ReturnType<typeof window.setTimeout>;
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
	speciesId: number;
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

export type PokemonTrainerInfo = {
	currentHandler: 'OriginalTrainer' | 'SomeoneElse';
	tid: number;
	sid: number;
	name: string;
	gender: string;
	handlingTrainerName: string;
	handlingTrainerGender: string;
};

export type SelectOption = {
	value: string;
	label: string;
};

export type IdNameOption = {
	id: number;
	name: string;
};

export type EncounterSearchResult = {
	id: number;
	species: string;
	version: string;
	location: string;
	ball: string;
	levelRange: string;
	form: string;
};

export type EncounterSearchState = {
	selectedVersionId?: number | null;
	versions: IdNameOption[];
	species: IdNameOption[];
	results: EncounterSearchResult[];
};

export type PokemonDetails = {
	source: 'party' | 'box' | 'draft';
	pokemon: PokemonSummary & {
		pid: string;
		types: {
			primary: number;
			secondary?: number | null;
		};
		friendship: number;
		gameVersion: string;
		nature: string;
		heldItemId: number;
		abilityId: number;
		formId: number;
		metBall: string;
		metBallId: number;
		metLocation: string;
		metLocationId: number;
		metLevel: number;
		metDate?: string | null;
		fatefulEncounter: boolean;
		trainer: PokemonTrainerInfo;
		legality: {
			valid: boolean;
			summary: string;
			issues: Array<{ code: string; message: string }>;
		};
		showdown: string;
		moves: Array<{ slot: string; id: number; name: string; typeId: number; isDummied: boolean; pp: number; maxPp: number }>;
		stats: PokemonStats;
		evs: PokemonStats;
		ivs: PokemonStats;
	};
	editor: {
		genders: SelectOption[];
		natures: SelectOption[];
		abilities: IdNameOption[];
		heldItems: IdNameOption[];
		forms: IdNameOption[];
		moves: IdNameOption[];
		balls: IdNameOption[];
		locations: IdNameOption[];
	};
};

export type SavePokemonPayload = {
	source: 'party' | 'box' | 'draft';
	uniqueId: string;
	pokemon: {
		nickname: string;
		level: number;
		shiny: boolean;
		gender: string;
		friendship: number;
		nature: string;
		heldItemId: number;
		abilityId: number;
		formId: number;
		moveIds: number[];
		evs: PokemonStats;
		ivs: PokemonStats;
		metBallId: number;
		metLocationId: number;
		metLevel: number;
		metDate?: string | null;
		fatefulEncounter: boolean;
		trainer: PokemonTrainerInfo;
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
	supportedItems: IdNameOption[];
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
		battlePoints?: number | null;
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
	sources: Array<{
		sourceUrl: string;
		sourceManifestUrl: string;
		name: string;
		description?: string | null;
		pluginCount: number;
		installedCount: number;
		isDefault: boolean;
	}>;
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
	#pingInterval: ReturnType<typeof window.setInterval> | null = null;

	constructor() {
		if (browser) {
			this.#attachListener();
		}
	}

	setFrame(frame: HTMLIFrameElement | null) {
		this.#frame = frame;
		this.#ready = false;
		this.#stopPinging();
		if (frame && browser) {
			this.#attachListener();
			frame.addEventListener('load', () => this.#pingBridge(), { once: true });
			this.#pingBridge();
		}
	}

	async ensureReady() {
		if (this.#ready) return;
		this.#startPinging();
		await new Promise<void>((resolve, reject) => {
			const timeout = window.setTimeout(() => {
				this.#stopPinging();
				reject(new Error(`Bridge did not become ready at ${this.url}.`));
			}, 10000);

			this.#readyWaiters.push(() => {
				window.clearTimeout(timeout);
				this.#stopPinging();
				resolve();
			});
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

	async updateTrainer(payload: { money: number; battlePoints?: number | null; gender: string }) {
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

	async getPokemon(source: 'party' | 'box' | 'draft', uniqueId: string) {
		return (await this.#request('getPokemon', { source, uniqueId })) as PokemonDetails;
	}

	async savePokemon(payload: SavePokemonPayload) {
		const result = (await this.#request('savePokemon', payload)) as PokemonDetails;
		this.#emitStateChanged();
		return result;
	}

	async loadDraftPokemon(fileName: string, base64: string) {
		return (await this.#request('loadDraftPokemon', { fileName, base64 })) as PokemonDetails;
	}

	async createCloneDraft(uniqueId: string) {
		return (await this.#request('createCloneDraft', { uniqueId })) as PokemonDetails;
	}

	async getDraftPokemon() {
		return (await this.#request('getDraftPokemon')) as PokemonDetails;
	}

	async addDraftPokemonToCollection(target: 'party' | 'box') {
		const result = (await this.#request('addDraftPokemonToCollection', { target })) as {
			added: boolean;
			source: 'party' | 'box';
			uniqueId: string;
			displayName: string;
		};
		this.#emitStateChanged();
		return result;
	}

	async clearDraftPokemon() {
		return (await this.#request('clearDraftPokemon')) as { cleared: boolean };
	}

	async getEncounterSearch() {
		return (await this.#request('getEncounterSearch')) as EncounterSearchState;
	}

	async searchEncounters(versionId: number, speciesId: number) {
		return (await this.#request('searchEncounters', { versionId, speciesId })) as EncounterSearchState;
	}

	async createEncounterDraft(encounterId: number) {
		return (await this.#request('createEncounterDraft', { encounterId })) as PokemonDetails;
	}

	async exportPokemon(uniqueId: string) {
		return (await this.#request('exportPokemon', { uniqueId })) as { fileName: string; base64: string };
	}

	async getItems() {
		return (await this.#request('getItems')) as ItemsSnapshot;
	}

	async setItemCount(inventoryType: string, itemId: number, count: number) {
		const result = (await this.#request('setItemCount', { inventoryType, itemId, count })) as ItemsSnapshot;
		this.#emitStateChanged();
		return result;
	}

	async getPluginFailures() {
		return (await this.#request('getPluginFailures')) as { failures: PluginFailure[] };
	}

	async dismissPluginFailure(pluginId: string, message: string) {
		return (await this.#request('dismissPluginFailure', { pluginId, message })) as { failures: PluginFailure[] };
	}

	async getPlugins() {
		return (await this.#request('getPlugins')) as PluginListResult;
	}

	async addPluginSource(sourceUrl: string) {
		return (await this.#request('addPluginSource', { sourceUrl })) as PluginListResult;
	}

	async removePluginSource(sourceUrl: string) {
		return (await this.#request('removePluginSource', { sourceUrl })) as PluginListResult;
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
				this.#stopPinging();
				for (const resolve of this.#readyWaiters.splice(0)) {
					resolve();
				}
				return;
			}

			if (data.type !== 'response' || !data.requestId) return;

			const pending = this.#pending.get(data.requestId);
			if (!pending) return;

			window.clearTimeout(pending.timeout);
			this.#pending.delete(data.requestId);
			if (data.success) {
				pending.resolve(data.data);
				return;
			}

			pending.reject(new Error(data.error ?? 'Bridge request failed.'));
		});
		this.#listenerAttached = true;
	}

	#pingBridge() {
		const frameWindow = this.#frame?.contentWindow;
		if (!frameWindow) return;
		frameWindow.postMessage({ channel, type: 'ping' }, '*');
	}

	#startPinging() {
		if (this.#pingInterval != null) return;
		this.#pingBridge();
		this.#pingInterval = window.setInterval(() => {
			if (this.#ready) {
				this.#stopPinging();
				return;
			}
			this.#pingBridge();
		}, 500);
	}

	#stopPinging() {
		if (this.#pingInterval == null) return;
		window.clearInterval(this.#pingInterval);
		this.#pingInterval = null;
	}

	async #request(command: string, payload: Record<string, unknown> = {}) {
		await this.ensureReady();
		const frameWindow = this.#frame?.contentWindow;
		if (!frameWindow) {
			throw new Error('Bridge iframe is not connected.');
		}

		const requestId = `${command}-${this.#requestId++}`;
		const promise = new Promise<unknown>((resolve, reject) => {
			const timeout = window.setTimeout(() => {
				this.#pending.delete(requestId);
				reject(new Error(`Bridge request '${command}' timed out.`));
			}, 15000);

			this.#pending.set(requestId, { resolve, reject, timeout });
		});

		frameWindow.postMessage({ channel, type: 'request', requestId, command, payload }, '*');
		return promise;
	}
}

export const bridgeClient = new BridgeClient();
