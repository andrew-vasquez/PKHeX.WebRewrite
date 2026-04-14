<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description, extra } = $props<{
		title: string;
		description?: string;
		extra?: Snippet;
	}>();
</script>

<header class="ant-page-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
	<div class="ant-page-header-heading-left space-y-1">
		<h1 class="ant-page-header-heading-title text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
		{#if description}
			<p class="ant-page-header-content max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
		{/if}
	</div>

	{#if extra}
		<div class="ant-page-header-heading-extra flex flex-wrap items-center gap-2">{@render extra()}</div>
	{/if}
</header>
