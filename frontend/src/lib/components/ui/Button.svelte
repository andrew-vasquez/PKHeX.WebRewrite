<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'default' | 'link' | 'danger';
	type Size = 'md' | 'lg';

	let {
		children,
		href,
		disabled = false,
		variant = 'default',
		size = 'md',
		class: className = '',
		onclick
	} = $props<{
		children?: Snippet;
		href?: string;
		disabled?: boolean;
		variant?: Variant;
		size?: Size;
		class?: string;
		onclick?: (event: MouseEvent) => void;
	}>();

	const sizeClasses: Record<Size, string> = {
		md: 'h-8 px-4 text-sm',
		lg: 'h-10 px-5 text-sm'
	};

	const variantClasses: Record<Variant, string> = {
		primary:
			'ant-btn-primary border border-[#2f6fed] bg-[#2f6fed] text-white hover:border-[#1d5fe0] hover:bg-[#1d5fe0] dark:border-[#5b8cff] dark:bg-[#5b8cff] dark:text-slate-950 dark:hover:border-[#79a2ff] dark:hover:bg-[#79a2ff]',
		default:
			'ant-btn-default border border-[#d6e0ea] bg-[#f8fbfd] text-slate-700 hover:border-[#2f6fed] hover:text-[#1d5fe0] dark:border-[#243249] dark:bg-[#111a2e] dark:text-slate-100 dark:hover:border-[#79a2ff] dark:hover:text-[#c7d8ff]',
		link:
			'ant-btn-link border border-transparent bg-transparent px-1 text-[#2f6fed] hover:text-[#1d5fe0] dark:text-[#8fb0ff] dark:hover:text-[#c7d8ff]',
		danger:
			'ant-btn-default border border-rose-300 bg-[#fdf8f8] text-rose-600 hover:border-rose-500 hover:text-rose-500 dark:border-rose-900/80 dark:bg-[#22131a] dark:text-rose-300 dark:hover:border-rose-700 dark:hover:text-rose-200'
	};

	let classes = $derived(
		`ant-btn inline-flex items-center justify-center gap-2 rounded-[2px] font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91caff] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950 ${sizeClasses[size as Size]} ${variantClasses[variant as Variant]} ${className}`
	);
</script>

{#if href}
	<a class={classes} {href} aria-disabled={disabled} onclick={onclick}>
		{@render children?.()}
	</a>
{:else}
	<button class={classes} type="button" {disabled} onclick={onclick}>
		{@render children?.()}
	</button>
{/if}
