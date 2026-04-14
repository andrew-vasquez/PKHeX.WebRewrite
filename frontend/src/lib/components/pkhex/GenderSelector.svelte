<script lang="ts">
	type Gender = 'Male' | 'Female' | 'Genderless';

	let { value = 'Male', disabled = false, genderless = false, onchange } = $props<{
		value?: Gender;
		disabled?: boolean;
		genderless?: boolean;
		onchange?: (value: Gender) => void;
	}>();

	function setValue(next: Gender) {
		if (disabled) return;
		onchange?.(next);
	}

	let options = $derived([
		{ value: 'Male' as const, label: '♂', activeClass: 'bg-[#1890ff] border-[#1890ff] text-white' },
		{ value: 'Female' as const, label: '♀', activeClass: 'bg-[#b218ff] border-[#b218ff] text-white' },
		...(genderless || value === 'Genderless'
			? [{ value: 'Genderless' as const, label: '⚲', activeClass: 'bg-[#5b5e5b] border-[#5b5e5b] text-white' }]
			: [])
	]);
</script>

<div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
	{#each options as option (option.value)}
		<button
			type="button"
			class={[
				'h-8 min-w-10 border-r border-slate-300 px-3 text-sm transition-colors last:border-r-0 dark:border-slate-700',
				value === option.value ? option.activeClass : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900',
				disabled ? 'cursor-not-allowed opacity-60' : ''
			]}
			disabled={disabled}
			onclick={() => setValue(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>
