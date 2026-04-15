<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { bridgeClient } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';

	let error = $state<string | null>(null);
	let target = $derived((page.url.searchParams.get('target') as 'party' | 'box' | null) ?? 'box');

	onMount(() => {
		void clone();
	});

	async function clone() {
		const uniqueId = page.params.id;
		if (!uniqueId) return;
		try {
			const details = await bridgeClient.createCloneDraft(uniqueId);
			await goto(`/pokemon/draft/${details.pokemon.uniqueId}?target=${target}`);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not clone Pokemon.';
		}
	}
</script>

{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}
