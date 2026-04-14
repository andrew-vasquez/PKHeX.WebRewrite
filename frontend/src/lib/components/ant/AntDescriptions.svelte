<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children, columns = 'md:grid-cols-2 xl:grid-cols-3' } = $props<{
		title?: string;
		children?: Snippet;
		columns?: string;
	}>();
</script>

<div class="ant-descriptions ant-descriptions-bordered ant-descriptions-small space-y-3">
	{#if title}
		<h2 class="ant-descriptions-title text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
	{/if}

	<div class={`ant-descriptions-view ant-description-grid ${columns}`}>
		{@render children?.()}
	</div>
</div>
