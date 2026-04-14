<script lang="ts">
	import { onMount } from 'svelte';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { bridgeClient } from '$lib/bridge/client';

	let error = $state<string | null>(null);

	onMount(() => {
		void exportSave();
	});

	async function exportSave() {
		try {
			const exported = await bridgeClient.exportSave();
			bridgeClient.downloadBase64File(exported.base64, exported.fileName);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Failed to export the save.';
		}
	}
</script>

<AntPageHeader title="Export save" description="This route keeps compatibility with the old export entry point." />

{#if error}
	<AntAlert tone="error">{error}</AntAlert>
{:else}
	<AntAlert tone="success">Export started. If the download did not begin, try again.</AntAlert>
{/if}

<div>
	<Button variant="primary" onclick={exportSave}>Export again</Button>
</div>
