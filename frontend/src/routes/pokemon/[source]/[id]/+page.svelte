<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { PokemonDetails } from '$lib/bridge/client';
	import { bridgeClient } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntDescriptionItem from '$lib/components/ant/AntDescriptionItem.svelte';
	import AntDescriptions from '$lib/components/ant/AntDescriptions.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import AntTable from '$lib/components/ant/AntTable.svelte';
	import AntTableRow from '$lib/components/ant/AntTableRow.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let details = $state<PokemonDetails | null>(null);
	let error = $state<string | null>(null);

	let source = $derived(page.params.source as 'party' | 'box');
	let uniqueId = $derived(page.params.id);

	onMount(() => {
		void load();
	});

	async function load() {
		try {
			if (!uniqueId) return;
			error = null;
			details = await bridgeClient.getPokemon(source, uniqueId);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load Pokemon.';
		}
	}

	async function exportPokemon() {
		if (!details) return;
		const exported = await bridgeClient.exportPokemon(details.pokemon.uniqueId);
		bridgeClient.downloadBase64File(exported.base64, exported.fileName);
	}

	async function copyShowdown() {
		if (!details) return;
		await navigator.clipboard.writeText(details.pokemon.showdown);
	}
</script>

<AntPageHeader title={details?.pokemon.displayName ?? 'Pokemon'} description="Phase 1 keeps this route read-mostly while the full editor migrates to Svelte.">
	{#snippet extra()}
		<Button variant="link" onclick={copyShowdown}>Showdown</Button>
		<Button variant="primary" onclick={exportPokemon}>Export *.pk</Button>
	{/snippet}
</AntPageHeader>

{#if error}
	<AntAlert tone="error">{error}</AntAlert>
{/if}

{#if details}
	<AntDescriptions>
		<AntDescriptionItem label="Species">{details.pokemon.species}</AntDescriptionItem>
		<AntDescriptionItem label="Level">{details.pokemon.level}</AntDescriptionItem>
		<AntDescriptionItem label="Nature">{details.pokemon.nature}</AntDescriptionItem>
		<AntDescriptionItem label="Ability">{details.pokemon.ability}</AntDescriptionItem>
		<AntDescriptionItem label="Held Item">{details.pokemon.heldItem}</AntDescriptionItem>
		<AntDescriptionItem label="Friendship">{details.pokemon.friendship}</AntDescriptionItem>
	</AntDescriptions>

	<AntTable columns="md:grid-cols-[6rem_minmax(0,1fr)_5rem_5rem]">
		{#snippet header()}
			<div>Slot</div>
			<div>Move</div>
			<div>PP</div>
			<div>Max PP</div>
		{/snippet}
		{#each details.pokemon.moves as move (move.slot)}
			<AntTableRow columns="md:grid-cols-[6rem_minmax(0,1fr)_5rem_5rem]">
				<div class="text-sm">{move.slot}</div>
				<div class="text-sm">{move.name}</div>
				<div class="text-sm">{move.pp}</div>
				<div class="text-sm">{move.maxPp}</div>
			</AntTableRow>
		{/each}
	</AntTable>

	<div class="grid gap-6 xl:grid-cols-3">
		<AntDescriptions title="Stats" columns="md:grid-cols-1">
			<AntDescriptionItem label="HP">{details.pokemon.stats.hp}</AntDescriptionItem>
			<AntDescriptionItem label="Atk">{details.pokemon.stats.atk}</AntDescriptionItem>
			<AntDescriptionItem label="Def">{details.pokemon.stats.def}</AntDescriptionItem>
			<AntDescriptionItem label="SpA">{details.pokemon.stats.spa}</AntDescriptionItem>
			<AntDescriptionItem label="SpD">{details.pokemon.stats.spd}</AntDescriptionItem>
			<AntDescriptionItem label="Spe">{details.pokemon.stats.spe}</AntDescriptionItem>
		</AntDescriptions>
		<AntDescriptions title="EVs" columns="md:grid-cols-1">
			<AntDescriptionItem label="HP">{details.pokemon.evs.hp}</AntDescriptionItem>
			<AntDescriptionItem label="Atk">{details.pokemon.evs.atk}</AntDescriptionItem>
			<AntDescriptionItem label="Def">{details.pokemon.evs.def}</AntDescriptionItem>
			<AntDescriptionItem label="SpA">{details.pokemon.evs.spa}</AntDescriptionItem>
			<AntDescriptionItem label="SpD">{details.pokemon.evs.spd}</AntDescriptionItem>
			<AntDescriptionItem label="Spe">{details.pokemon.evs.spe}</AntDescriptionItem>
		</AntDescriptions>
		<AntDescriptions title="IVs" columns="md:grid-cols-1">
			<AntDescriptionItem label="HP">{details.pokemon.ivs.hp}</AntDescriptionItem>
			<AntDescriptionItem label="Atk">{details.pokemon.ivs.atk}</AntDescriptionItem>
			<AntDescriptionItem label="Def">{details.pokemon.ivs.def}</AntDescriptionItem>
			<AntDescriptionItem label="SpA">{details.pokemon.ivs.spa}</AntDescriptionItem>
			<AntDescriptionItem label="SpD">{details.pokemon.ivs.spd}</AntDescriptionItem>
			<AntDescriptionItem label="Spe">{details.pokemon.ivs.spe}</AntDescriptionItem>
		</AntDescriptions>
	</div>

	<div>
		<label for="showdown-output" class="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">Showdown</label>
		<textarea id="showdown-output" class="ant-textarea" readonly value={details.pokemon.showdown}></textarea>
	</div>
{/if}
