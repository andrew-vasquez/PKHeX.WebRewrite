<script lang="ts">
	let { speciesId, shiny = false, alt = 'Pokemon', size = 'lg' } = $props<{
		speciesId: number;
		shiny?: boolean;
		alt?: string;
		size?: 'sm' | 'md' | 'lg';
	}>();

	let spriteUrl = $derived(
		speciesId
			? shiny
				? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${speciesId}.gif`
				: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${speciesId}.gif`
			: null
	);
	let sizeClass = $derived(size === 'sm' ? 'h-10 w-10' : size === 'md' ? 'h-16 w-16' : 'h-24 w-24');
</script>

{#if spriteUrl}
	<div class={`relative flex items-center justify-center ${sizeClass}`}>
		{#if shiny}
			<span class="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-amber-500 px-1.5 py-0.5 text-[8px] uppercase text-white">shiny</span>
		{/if}
		<img src={spriteUrl} alt={alt} class="max-h-full max-w-full object-contain image-render-pixel" loading="lazy" />
	</div>
{/if}
