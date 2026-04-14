<script lang="ts">
	let { checked = false, disabled = false, onchange } = $props<{
		checked?: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}>();

	let trackClass = $derived(
		checked
			? 'border-[#365c9a] bg-[#8cb4ff] text-[#10233d] dark:border-[#5b8cff] dark:bg-[#2f6fed] dark:text-[#eff6ff]'
			: 'border-[#8aa0b8] bg-[#d9e3ee] text-[#42576d] dark:border-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]'
	);

	let thumbClass = $derived(checked ? 'translate-x-[1.4rem]' : 'translate-x-0');
	let activeLabel = $derived(checked ? 'D' : 'L');

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		onchange?.(target.checked);
	}
</script>

<label class={`inline-flex items-center ${disabled ? '' : 'md:cursor-pointer'}`}>
	<input class="peer sr-only" type="checkbox" {checked} {disabled} onchange={handleChange} />
	<span
		class={`relative inline-flex h-6 w-14 items-center overflow-hidden rounded-[3px] border-2 px-1 text-[9px] leading-none uppercase tracking-[0.08em] transition-colors ${trackClass} ${disabled ? 'opacity-50' : ''}`}
	>
		<span
			class={`absolute left-0.5 top-0.5 h-4 w-5 rounded-[1px] border border-[#1e293b] bg-[#f8fafc] shadow-[1px_1px_0_rgba(15,23,42,0.45)] transition-transform dark:border-[#cbd5e1] dark:bg-[#e2e8f0] ${thumbClass}`}
		>
			<span class="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#0f172a]">
				{activeLabel}
			</span>
		</span>
	</span>
</label>
