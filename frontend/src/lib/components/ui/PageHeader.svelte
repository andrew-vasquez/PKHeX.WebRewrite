<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description, actions } = $props<{
		title: string;
		description?: string;
		actions?: Snippet;
	}>();
</script>

<header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
		{#if description}
			<p class="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
		{/if}
	</div>

	{#if actions}
		<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
	{/if}
</header>
