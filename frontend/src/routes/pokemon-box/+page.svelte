<script lang="ts">
	import { onMount } from 'svelte';
	import type { PokemonCollection } from '$lib/bridge/client';
	import { bridgeClient } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import AntTable from '$lib/components/ant/AntTable.svelte';
	import AntTableRow from '$lib/components/ant/AntTableRow.svelte';
	import ButtonOrMenu from '$lib/components/pkhex/ButtonOrMenu.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let collection = $state<PokemonCollection | null>(null);
	let error = $state<string | null>(null);

	onMount(() => {
		void load();
	});

	async function load() {
		try {
			error = null;
			collection = await bridgeClient.getCollection('box');
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load box.';
		}
	}

	async function copyShowdown() {
		if (!collection?.showdown) return;
		await navigator.clipboard.writeText(collection.showdown);
	}

	let actions = $derived([
		{ variant: 'primary' as const, label: 'Add', onclick: async () => {} },
		{ variant: 'link' as const, label: 'Showdown', onclick: copyShowdown }
	]);
</script>

<AntPageHeader title="Box" description="Your stored Pokemon box entries, flattened into a mobile-friendly table.">
	{#snippet extra()}
		<ButtonOrMenu actions={actions} />
	{/snippet}
</AntPageHeader>

{#if error}
	<AntAlert tone="error">{error}</AntAlert>
{/if}

{#if collection}
	<AntTable columns="md:grid-cols-[minmax(0,1.8fr)_6rem_8rem_7rem]">
		{#snippet header()}
			<div>Name</div>
			<div>Level</div>
			<div>Ability</div>
			<div>Action</div>
		{/snippet}
		{#each collection.entries as pokemon (pokemon.uniqueId)}
			<AntTableRow columns="md:grid-cols-[minmax(0,1.8fr)_6rem_8rem_7rem]">
				<div class="min-w-0">
					<p class="text-sm text-slate-900 dark:text-slate-50">{pokemon.displayName}</p>
					<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{pokemon.form || 'Default form'}</p>
				</div>
				<div class="text-sm">{pokemon.level}</div>
				<div class="text-sm">{pokemon.ability}</div>
				<div><Button variant="link" href={`/pokemon/box/${pokemon.uniqueId}`}>View</Button></div>
			</AntTableRow>
		{/each}
	</AntTable>
{/if}
