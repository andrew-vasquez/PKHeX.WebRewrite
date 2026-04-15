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
			metadata = await fetchJson(`/pokemon/${page.params.id}`, { credentials: 'include' });
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load cloud Pokemon.';
		}
	}

	async function download() {
		if (!metadata) return;
		const response = await fetch(backendUrl(`/pokemon/${page.params.id}/file`), { credentials: 'include' });
		const blob = await response.blob();
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `${metadata.species}-${metadata.id}.bin`;
		link.click();
		URL.revokeObjectURL(link.href);
	}
</script>

<AntPageHeader title={metadata?.nickname || metadata?.species || 'Cloud Pokemon'} description="A lightweight cloud detail page while the richer authenticated editor stays on the legacy side.">
	{#snippet extra()}<Button variant="primary" onclick={download}>Download</Button>{/snippet}
</AntPageHeader>
{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}
{#if metadata}
	<AntDescriptions>
		<AntDescriptionItem label="Species">{metadata.species}</AntDescriptionItem>
		<AntDescriptionItem label="Level">{metadata.level}</AntDescriptionItem>
		<AntDescriptionItem label="Nature">{metadata.nature}</AntDescriptionItem>
		<AntDescriptionItem label="Ability">{metadata.ability}</AntDescriptionItem>
		<AntDescriptionItem label="Public">{metadata.isPublic ? 'Yes' : 'No'}</AntDescriptionItem>
		<AntDescriptionItem label="Download Allowed">{metadata.allowDownload ? 'Yes' : 'No'}</AntDescriptionItem>
	</AntDescriptions>
{/if}
