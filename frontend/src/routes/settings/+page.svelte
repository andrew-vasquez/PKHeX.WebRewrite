<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import AntDescriptions from '$lib/components/ant/AntDescriptions.svelte';
	import AntDescriptionItem from '$lib/components/ant/AntDescriptionItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const calculatorKey = '__settings__#calculatorUrl';

	let calculatorUrl = $state('https://calc.pokemonshowdown.com');

	onMount(() => {
		if (!browser) return;
		calculatorUrl = localStorage.getItem(calculatorKey) ?? 'https://calc.pokemonshowdown.com';
	});

	function saveCalculator() {
		if (!browser) return;
		const normalized = calculatorUrl.trim().replace(/\/$/, '');
		calculatorUrl = normalized;
		localStorage.setItem(calculatorKey, normalized);
	}
</script>

<AntPageHeader title="Settings" description="General calculator and appearance preferences preserved in browser storage." />

<AntDescriptions title="General" columns="md:grid-cols-1">
	<AntDescriptionItem label="Calculator">
		<div class="flex flex-col gap-2 sm:flex-row">
			<input class="ant-field" bind:value={calculatorUrl} placeholder="Calculator or URL (Default: Showdown)" />
			<Button variant="primary" onclick={saveCalculator}>Save</Button>
		</div>
	</AntDescriptionItem>
</AntDescriptions>
