<script lang="ts">
	import type { Snippet } from 'svelte';

	let { columns, children } = $props<{ columns: string; children?: Snippet }>();
</script>

<div class={`ant-table-row ant-table-tbody-row ${columns}`}>
	{@render children?.()}
</div>
