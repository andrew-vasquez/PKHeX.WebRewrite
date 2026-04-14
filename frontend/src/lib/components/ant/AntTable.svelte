<script lang="ts">
	import type { Snippet } from 'svelte';

	let { columns, header, children } = $props<{
		columns: string;
		header?: Snippet;
		children?: Snippet;
	}>();
</script>

	<div class="ant-table ant-table-small ant-table-bordered ant-table-shell">
	{#if header}
		<div class={`ant-table-row ant-table-head ${columns}`}>{@render header()}</div>
	{/if}
	{@render children?.()}
</div>
