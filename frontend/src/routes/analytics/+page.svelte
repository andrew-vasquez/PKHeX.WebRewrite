<script lang="ts">
	import { onMount } from 'svelte';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import Panel from '$lib/components/ui/Panel.svelte';

	type GameLoad = { versionName: string; country: string; count: string };
	type ItemChanged = { itemId: string; count: string };
	type PokemonSaved = { speciesId: string; speciesName: string; count: string };

	let error = $state<string | null>(null);
	let gameLoads = $state<GameLoad[]>([]);
	let items = $state<ItemChanged[]>([]);
	let species = $state<PokemonSaved[]>([]);

	onMount(() => {
		void load();
	});

	async function load() {
		try {
			error = null;
			const [gameLoaded, itemChanged, pokemonSaved] = await Promise.all([
				fetch('https://raw.githubusercontent.com/pkhex-web/analytics/main/data/game_loaded_by_country.json').then((r) => r.json() as Promise<GameLoad[]>),
				fetch('https://raw.githubusercontent.com/pkhex-web/analytics/main/data/items_changed_by_country.json').then((r) => r.json() as Promise<ItemChanged[]>),
				fetch('https://raw.githubusercontent.com/pkhex-web/analytics/main/data/pokemon_saved_by_country.json').then((r) => r.json() as Promise<PokemonSaved[]>)
			]);
			gameLoads = gameLoaded;
			items = itemChanged;
			species = pokemonSaved;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load analytics results.';
		}
	}

	let topVersions = $derived(
		Object.entries(
			gameLoads.reduce<Record<string, number>>((acc, entry) => {
				acc[entry.versionName] = (acc[entry.versionName] ?? 0) + Number.parseInt(entry.count, 10);
				return acc;
			}, {})
		)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
	);

	let topSpecies = $derived(
		Object.entries(
			species.reduce<Record<string, number>>((acc, entry) => {
				acc[entry.speciesName] = (acc[entry.speciesName] ?? 0) + Number.parseInt(entry.count, 10);
				return acc;
			}, {})
		)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
	);

	let topItems = $derived(
		Object.entries(
			items.reduce<Record<string, number>>((acc, entry) => {
				acc[entry.itemId] = (acc[entry.itemId] ?? 0) + Number.parseInt(entry.count, 10);
				return acc;
			}, {})
		)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
	);
</script>

<AntPageHeader title="Analytics" description="A lightweight Svelte readout of the existing public PKHeX.Web analytics dataset." />
{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}

<div class="grid gap-6 xl:grid-cols-3">
	<Panel title="Top Versions">
		<ol class="space-y-2 text-sm">
			{#each topVersions as [label, value]}
				<li class="flex items-center justify-between gap-3"><span>{label}</span><strong>{value}</strong></li>
			{/each}
		</ol>
	</Panel>
	<Panel title="Top Species">
		<ol class="space-y-2 text-sm">
			{#each topSpecies as [label, value]}
				<li class="flex items-center justify-between gap-3"><span>{label}</span><strong>{value}</strong></li>
			{/each}
		</ol>
	</Panel>
	<Panel title="Top Items">
		<ol class="space-y-2 text-sm">
			{#each topItems as [label, value]}
				<li class="flex items-center justify-between gap-3"><span>{label}</span><strong>{value}</strong></li>
			{/each}
		</ol>
	</Panel>
</div>
