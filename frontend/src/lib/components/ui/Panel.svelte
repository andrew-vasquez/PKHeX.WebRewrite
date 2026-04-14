<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		title,
		description,
		actions,
		class: className = ''
	} = $props<{
		children?: Snippet;
		title?: string;
		description?: string;
		actions?: Snippet;
		class?: string;
	}>();
</script>

<section class={`ant-card ant-card-bordered ant-card-shell p-5 dark:bg-slate-925 ${className}`}>
	{#if title || description || actions}
		<header class="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
			<div class="space-y-1">
				{#if title}
					<h2 class="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
				{/if}
				{#if description}
					<p class="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
				{/if}
			</div>

			{#if actions}
				<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
			{/if}
		</header>
	{/if}

	<div class="space-y-4">
		{@render children?.()}
	</div>
</section>
