<script lang="ts">
	import { onMount } from 'svelte';
	import type { InventorySnapshot, ItemsSnapshot } from '$lib/bridge/client';
	import { bridgeClient } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import AntTable from '$lib/components/ant/AntTable.svelte';
	import AntTableRow from '$lib/components/ant/AntTableRow.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let snapshot = $state<ItemsSnapshot | null>(null);
	let activeType = $state<string>('');
	let error = $state<string | null>(null);
	let editing: { itemId: number; count: string } | null = $state(null);

	onMount(() => {
		void load();
	});

	let activeInventory = $derived(
		snapshot?.inventories.find((inventory) => inventory.type === activeType) ?? snapshot?.inventories[0] ?? null
	);

	async function load() {
		try {
			error = null;
			snapshot = await bridgeClient.getItems();
			activeType = snapshot.inventoryTypes[0] ?? '';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load items.';
		}
	}

	function startEdit(item: InventorySnapshot['items'][number]) {
		editing = { itemId: item.id, count: `${item.count}` };
	}

	async function persistItem() {
		if (!activeInventory || !editing) return;
		try {
			snapshot = await bridgeClient.setItemCount(activeInventory.type, editing.itemId, Number.parseInt(editing.count, 10) || 0);
			error = null;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not update item count.';
		} finally {
			editing = null;
		}
	}
</script>

<AntPageHeader title="Items" description="Inventory pouches from the loaded save, with inline count editing instead of the old modal." />

{#if error}
	<AntAlert tone="error">{error}</AntAlert>
{/if}

{#if snapshot}
	<div class="flex flex-wrap gap-2">
		{#each snapshot.inventoryTypes as type (type)}
			<Button variant={type === activeType ? 'primary' : 'default'} onclick={() => (activeType = type)}>{type}</Button>
		{/each}
	</div>

	{#if activeInventory}
		<AntTable columns="md:grid-cols-[minmax(0,1.8fr)_8rem_10rem]">
			{#snippet header()}
				<div>Name</div>
				<div>Amount</div>
				<div>Action</div>
			{/snippet}
			{#each activeInventory.items as item (item.id)}
				<AntTableRow columns="md:grid-cols-[minmax(0,1.8fr)_8rem_10rem]">
					<div class="text-sm text-slate-900 dark:text-slate-50">{item.name}</div>
					<div class="text-sm">{item.count}</div>
					<div><Button variant="link" onclick={() => startEdit(item)}>Edit</Button></div>
				</AntTableRow>
			{/each}
		</AntTable>

		{#if editing}
			<div class="ant-card-shell flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="space-y-1">
					<p class="text-sm font-medium text-slate-900 dark:text-slate-50">Edit item count</p>
					<p class="text-xs text-slate-500 dark:text-slate-400">Setting the amount to `0` removes the item.</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<input class="ant-field w-28" bind:value={editing.count} inputmode="numeric" />
					<Button variant="primary" onclick={persistItem}>Save</Button>
					<Button variant="default" onclick={() => (editing = null)}>Cancel</Button>
				</div>
			</div>
		{/if}
	{/if}
{/if}
