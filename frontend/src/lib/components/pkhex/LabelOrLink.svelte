<script lang="ts">
	let { label, href } = $props<{ label: string; href?: string | null }>();
</script>

{#if href}
	<span class="inline-flex items-center gap-1.5">
		<a href={href} target="_blank" rel="noreferrer" class="text-[#1677ff] hover:text-[#4096ff] dark:text-[#69b1ff] dark:hover:text-[#91caff]">{label}</a>
		<span aria-hidden="true" class="text-xs text-slate-400">↗</span>
	</span>
{:else}
	{label}
{/if}
