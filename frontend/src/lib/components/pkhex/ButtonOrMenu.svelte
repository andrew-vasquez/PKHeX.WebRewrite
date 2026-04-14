<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	export type ButtonAction = {
		variant?: 'primary' | 'default' | 'link' | 'danger';
		label: string;
		onclick?: () => void | Promise<void>;
		disabled?: boolean;
		disabledMessage?: string;
	};

	let { actions = [] } = $props<{ actions?: ButtonAction[] }>();
	let open = $state(false);

	let first = $derived(actions[0] ?? null);
	let others = $derived(actions.slice(1));

	async function handleAction(action: ButtonAction) {
		if (action.disabled) return;
		open = false;
		await action.onclick?.();
	}
</script>

{#if actions.length === 1 && first}
	<div title={first.disabledMessage}>
		<Button variant={first.variant ?? 'primary'} disabled={first.disabled} onclick={() => handleAction(first)}>{first.label}</Button>
	</div>
{:else if actions.length > 1 && first}
	<div class="relative inline-flex">
		<Button variant={first.variant ?? 'primary'} disabled={first.disabled} onclick={() => handleAction(first)}>{first.label}</Button>
		<Button class="px-2" variant={first.variant ?? 'primary'} onclick={() => (open = !open)}>⋯</Button>

		{#if open}
			<div class="absolute right-0 top-full z-20 mt-2 max-h-64 min-w-44 overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
				{#each others as action (action.label)}
					<button
						type="button"
						class="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-900"
						title={action.disabledMessage}
						disabled={action.disabled}
						onclick={() => handleAction(action)}
					>
						{action.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
