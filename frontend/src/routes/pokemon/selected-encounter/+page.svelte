<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { bridgeClient } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';

	let error = $state<string | null>(null);

	onMount(() => {
		void redirect();
	});

	async function redirect() {
		try {
			const details = await bridgeClient.getDraftPokemon();
			await goto(`/pokemon/draft/${details.pokemon.uniqueId}`);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'No encounter draft is available.';
		}
	}
</script>

{#if error}<AntAlert tone="error">{error}</AntAlert>{/if}
