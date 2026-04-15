<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { backendUrl, fetchJson } from '$lib/backend-api';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntDescriptionItem from '$lib/components/ant/AntDescriptionItem.svelte';
	import AntDescriptions from '$lib/components/ant/AntDescriptions.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let metadata = $state<any | null>(null);
	let error = $state<string | null>(null);

	onMount(() => {
		void load();
	});

	async function load() {
		try {
			error = null;
			metadata = await fetchJson(`/public/pokemon/${page.params.id}`);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load shared Pokemon.';
		}
	}

	async function download() {
		if (!metadata) return;
		const response = await fetch(backendUrl(`/public/pokemon/${page.params.id}/file`));
		const blob = await response.blob();
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `${metadata.species}-${metadata.id}.bin`;
		link.click();
		URL.revokeObjectURL(link.href);
	}
</script>

<AntPageHeader title={metadata?.nickname || metadata?.species || 'Shared Pokemon'} description="Read-only public Pokemon metadata from the existing backend API.">
	{#snippet extra()}
		{#if metadata?.allowDownload}<Button variant="primary" onclick={download}>Download</Button>{/if}
	{/snippet}
</AntPageHeader>
{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}

{#if metadata}
	<AntDescriptions>
		<AntDescriptionItem label="Species">{metadata.species}</AntDescriptionItem>
		<AntDescriptionItem label="Level">{metadata.level}</AntDescriptionItem>
		<AntDescriptionItem label="Nature">{metadata.nature}</AntDescriptionItem>
		<AntDescriptionItem label="Ability">{metadata.ability}</AntDescriptionItem>
		<AntDescriptionItem label="Held Item">{metadata.heldItem?.name ?? 'None'}</AntDescriptionItem>
		<AntDescriptionItem label="Uploaded">{new Date(metadata.uploadedAtUtc).toLocaleString()}</AntDescriptionItem>
	</AntDescriptions>

	<div class="grid gap-6 xl:grid-cols-3">
		<AntDescriptions title="Moves" columns="md:grid-cols-1">
			{#each metadata.moves as move, index (`${move.id}-${index}`)}
				<AntDescriptionItem label={`Move ${index + 1}`}>{move.name}</AntDescriptionItem>
			{/each}
		</AntDescriptions>
		<AntDescriptions title="Stats" columns="md:grid-cols-1">
			<AntDescriptionItem label="HP">{metadata.stats.base.health}</AntDescriptionItem>
			<AntDescriptionItem label="Atk">{metadata.stats.base.attack}</AntDescriptionItem>
			<AntDescriptionItem label="Def">{metadata.stats.base.defense}</AntDescriptionItem>
			<AntDescriptionItem label="SpA">{metadata.stats.base.specialAttack}</AntDescriptionItem>
			<AntDescriptionItem label="SpD">{metadata.stats.base.specialDefense}</AntDescriptionItem>
			<AntDescriptionItem label="Spe">{metadata.stats.base.speed}</AntDescriptionItem>
		</AntDescriptions>
		<AntDescriptions title="Met" columns="md:grid-cols-1">
			<AntDescriptionItem label="Location">{metadata.metConditions.location}</AntDescriptionItem>
			<AntDescriptionItem label="Level">{metadata.metConditions.level}</AntDescriptionItem>
			<AntDescriptionItem label="Date">{metadata.metConditions.date ?? 'Unknown'}</AntDescriptionItem>
			<AntDescriptionItem label="Ball">{metadata.metConditions.ballId}</AntDescriptionItem>
		</AntDescriptions>
	</div>
{/if}
