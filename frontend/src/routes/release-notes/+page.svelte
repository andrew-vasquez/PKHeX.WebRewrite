<script lang="ts">
	import { page } from '$app/state';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';

	const entries = [
		{ date: '2026-03-20', items: ['Upgraded PKHeX.Core and ALM plugins to the latest version', 'Upgraded from .NET 9.x to 10.x', 'Small bug fixes'] },
		{ date: '2025-05-01', items: ['Fixed exporting of Let\'s Go Eevee save files', 'Updated the privacy policy and cookie consent', 'Upgraded PKHeX.Core and ALM plugins to the latest version'] },
		{ date: '2025-03-25', items: ['Introduced plugin error pages for plugin execution failures', 'Upgraded PKHeX.Core and ALM plugins to the latest version'] },
		{ date: '2025-02-14', items: ['Minor bug fixes', 'News banner'] },
		{ date: '2024-11-30', items: ['Migrated to .NET 9', 'Upgraded PKHeX.Core and ALM plugins to the latest', 'Added support for Battle Points'] },
		{ date: '2024-11-29', items: ['Introduced the PKHeX.Web Cloud (alpha) with up to 6 Pokemon stored in the cloud'] }
	];

	let since = $derived(page.url.searchParams.get('since'));
	function isNew(date: string) {
		return since ? date > since : false;
	}
</script>

<AntPageHeader title="Release Notes" />

<div class="space-y-8">
	{#each entries as entry (entry.date)}
		<section class="space-y-3">
			<div class="flex items-center gap-3">
				<h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">{entry.date}</h2>
				{#if isNew(entry.date)}
					<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">new</span>
				{/if}
			</div>
			<ul class="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
				{#each entry.items as item}
					<li>{item}</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
