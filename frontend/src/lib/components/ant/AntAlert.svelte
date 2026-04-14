<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'info' | 'success' | 'error';

	let { tone = 'info', children } = $props<{ tone?: Tone; children?: Snippet }>();

	const toneClasses: Record<Tone, string> = {
		info: 'border-sky-200 bg-sky-50/90 text-sky-800 dark:border-sky-900/80 dark:bg-sky-950/30 dark:text-sky-200',
		success:
			'border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/30 dark:text-emerald-200',
		error:
			'border-rose-200 bg-rose-50/90 text-rose-800 dark:border-rose-900/80 dark:bg-rose-950/30 dark:text-rose-200'
	};
</script>

<div class={`rounded-lg border px-4 py-3 text-sm ${toneClasses[tone as Tone]}`}>
	{@render children?.()}
</div>
