<script lang="ts">
	import type { Snippet } from 'svelte';
	import AntDescriptions from '$lib/components/ant/AntDescriptions.svelte';

	let { title, children } = $props<{ title?: string; children?: Snippet }>();
</script>

<AntDescriptions {title} columns="md:grid-cols-2 xl:grid-cols-3">
	{@render children?.()}
</AntDescriptions>
