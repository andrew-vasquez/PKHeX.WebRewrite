<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children } = $props<{ label: string; children?: Snippet }>();
</script>

<div class="ant-descriptions-row ant-description-item">
	<div class="ant-descriptions-item-label ant-description-label">{label}</div>
	<div class="ant-descriptions-item-content min-w-0 text-sm text-slate-900 dark:text-slate-100">{@render children?.()}</div>
</div>
