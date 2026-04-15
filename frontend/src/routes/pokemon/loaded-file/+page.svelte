<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { bridgeClient } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let fileInput = $state<HTMLInputElement | null>(null);
	let error = $state<string | null>(null);
	let busy = $state<string | null>(null);
	let target = $derived((page.url.searchParams.get('target') as 'party' | 'box' | null) ?? 'box');

	async function handleFileSelection(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			busy = `Loading ${file.name}`;
			const details = await bridgeClient.loadDraftPokemon(file.name, await bridgeClient.fileToBase64(file));
			await goto(`/pokemon/draft/${details.pokemon.uniqueId}?target=${target}`);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load Pokemon file.';
		} finally {
			busy = null;
			input.value = '';
		}
	}
</script>

<input bind:this={fileInput} type="file" class="hidden" onchange={handleFileSelection} />
<AntPageHeader title="Load Pokemon File" description="Import a PKM/PKX-style file into a draft editor, then add it to your box.">
	{#snippet extra()}<Button variant="primary" onclick={() => fileInput?.click()}>Choose file</Button>{/snippet}
</AntPageHeader>
{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}
{#if busy}<AntAlert tone="info">{busy}...</AntAlert>{/if}
