<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { bridgeClient, type EncounterSearchState } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import AntTable from '$lib/components/ant/AntTable.svelte';
	import AntTableRow from '$lib/components/ant/AntTableRow.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Panel from '$lib/components/ui/Panel.svelte';

	let searchState: EncounterSearchState | null = $state(null);
	let versionId = $state('');
	let speciesId = $state('');
	let error: string | null = $state(null);
	let target = $derived((page.url.searchParams.get('target') as 'party' | 'box' | null) ?? 'box');

	onMount(() => {
		void load();
	});

	async function load() {
		try {
			searchState = await bridgeClient.getEncounterSearch();
			versionId = `${searchState.selectedVersionId ?? ''}`;
			speciesId = '';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load encounter search.';
		}
	}

	async function search() {
		if (!versionId || !speciesId) return;
		try {
			error = null;
			searchState = await bridgeClient.searchEncounters(Number.parseInt(versionId, 10), Number.parseInt(speciesId, 10));
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not search encounters.';
		}
	}

	async function createDraft(encounterId: number) {
		try {
			const details = await bridgeClient.createEncounterDraft(encounterId);
			await goto(`/pokemon/draft/${details.pokemon.uniqueId}?target=${target}`);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not create Pokemon from encounter.';
		}
	}
</script>

<AntPageHeader title="Encounter Search" description="Search legal encounter templates from the loaded game and turn one into an editable draft Pokemon." />
{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}

{#if searchState}
	<Panel title="Search Filters">
		<div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
			<select class="ant-field" bind:value={versionId}>
				<option value="">Select version</option>
				{#each searchState.versions as version (version.id)}
					<option value={version.id}>{version.name}</option>
				{/each}
			</select>
			<select class="ant-field" bind:value={speciesId}>
				<option value="">Select species</option>
				{#each searchState.species as species (species.id)}
					<option value={species.id}>{species.name}</option>
				{/each}
			</select>
			<Button variant="primary" onclick={search}>Search</Button>
		</div>
	</Panel>

	{#if searchState.results.length}
		<AntTable columns="md:grid-cols-[minmax(0,1.1fr)_10rem_10rem_8rem_8rem]">
			{#snippet header()}<div>Location</div><div>Version</div><div>Level</div><div>Ball</div><div>Action</div>{/snippet}
			{#each searchState.results as result (result.id)}
				<AntTableRow columns="md:grid-cols-[minmax(0,1.1fr)_10rem_10rem_8rem_8rem]">
					<div class="min-w-0">
						<p class="text-sm text-slate-900 dark:text-slate-50">{result.species}</p>
						<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{result.location}{result.form ? ` • ${result.form}` : ''}</p>
					</div>
					<div class="text-sm">{result.version}</div>
					<div class="text-sm">{result.levelRange}</div>
					<div class="text-sm">{result.ball}</div>
					<div><Button variant="link" onclick={() => createDraft(result.id)}>Create</Button></div>
				</AntTableRow>
			{/each}
		</AntTable>
	{/if}
{/if}
	let target = $derived((page.url.searchParams.get('target') as 'party' | 'box' | null) ?? 'box');
