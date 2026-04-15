<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchJson } from '$lib/backend-api';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import AntTable from '$lib/components/ant/AntTable.svelte';
	import AntTableRow from '$lib/components/ant/AntTableRow.svelte';

	let items = $state<any[]>([]);
	let error = $state<string | null>(null);

	onMount(() => {
		void load();
	});

	async function load() {
		try {
			error = null;
			items = await fetchJson('/pokemon', { credentials: 'include' });
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load cloud Pokemon. Sign in to the backend API first if needed.';
		}
	}
</script>

<AntPageHeader title="Pokemon Cloud" description="Cloud-backed Pokemon metadata from the existing backend API, when available." />
{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}

{#if items.length}
	<AntTable columns="md:grid-cols-[minmax(0,1.6fr)_7rem_8rem]">
		{#snippet header()}<div>Name</div><div>Level</div><div>Updated</div>{/snippet}
		{#each items as item (item.id)}
			<AntTableRow columns="md:grid-cols-[minmax(0,1.6fr)_7rem_8rem]">
				<div class="min-w-0"><a href={`/cloud/pokemon/${item.id}`}>{item.nickname || item.species}</a></div>
				<div class="text-sm">{item.level}</div>
				<div class="text-sm">{new Date(item.lastSyncedAt).toLocaleDateString()}</div>
			</AntTableRow>
		{/each}
	</AntTable>
{/if}
