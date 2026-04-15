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
	let notice = $state<string | null>(null);
	let editing: { itemId: number; count: string } | null = $state(null);
	let adding: { itemId: string; count: string } | null = $state(null);

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
			notice = 'Item updated.';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not update item count.';
		} finally {
			editing = null;
		}
	}

	function startAdd() {
		if (!activeInventory) return;
		const firstSupported = activeInventory.supportedItems[0];
		adding = {
			itemId: firstSupported ? `${firstSupported.id}` : '',
			count: '1'
		};
	}

	async function persistAddedItem() {
		if (!activeInventory || !adding || !adding.itemId) return;
		try {
			snapshot = await bridgeClient.setItemCount(
				activeInventory.type,
				Number.parseInt(adding.itemId, 10) || 0,
				Number.parseInt(adding.count, 10) || 0
			);
			error = null;
			notice = 'Item added.';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not add item.';
		} finally {
			adding = null;
		}
	}
</script>

<AntPageHeader title="Items" description="Inventory pouches from the loaded save, with inline editing and add-item support in the Svelte shell.">
	{#snippet extra()}
		<Button variant="primary" onclick={startAdd} disabled={!activeInventory?.supportedItems.length}>Add item</Button>
	{/snippet}
</AntPageHeader>

{#if error}
	<AntAlert tone="error">{error}</AntAlert>
{/if}

{#if notice}
	<AntAlert tone="success">{notice}</AntAlert>
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

		{#if adding}
			<div class="ant-card-shell flex flex-col gap-3 p-4">
				<div class="space-y-1">
					<p class="text-sm font-medium text-slate-900 dark:text-slate-50">Add item to {activeInventory.type}</p>
					<p class="text-xs text-slate-500 dark:text-slate-400">Only items supported by the selected pouch are listed.</p>
				</div>
				<div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem_auto]">
					<select class="ant-field" bind:value={adding.itemId}>
						{#each activeInventory.supportedItems as item (item.id)}
							<option value={item.id}>{item.name}</option>
						{/each}
					</select>
					<input class="ant-field" bind:value={adding.count} inputmode="numeric" placeholder="Count" />
					<div class="flex flex-wrap items-center gap-2">
						<Button variant="primary" onclick={persistAddedItem}>Add</Button>
						<Button variant="default" onclick={() => (adding = null)}>Cancel</Button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
{/if}
