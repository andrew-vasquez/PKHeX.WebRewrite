<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { bridgeClient, type BridgeSnapshot } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntDescriptionItem from '$lib/components/ant/AntDescriptionItem.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import GenderSelector from '$lib/components/pkhex/GenderSelector.svelte';
	import ResponsibleDescriptions from '$lib/components/pkhex/ResponsibleDescriptions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Panel from '$lib/components/ui/Panel.svelte';

	let snapshot = $state<BridgeSnapshot | null>(null);
	let error = $state<string | null>(null);
	let notice = $state<string | null>(null);
	let busyLabel = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let money = $state('0');
	let battlePoints = $state('0');
	let gender = $state('Male');

	const demoSaveUrl =
		'https://raw.githubusercontent.com/projectpokemon/ProjectCompleteDexSaves/master/Gen%204%20-%20Pokemon%20SoulSilver%20(ENG).sav';

	onMount(() => {
		void refreshState();
	});

	function syncTrainerForm(next: BridgeSnapshot | null) {
		money = `${next?.trainer?.money ?? 0}`;
		battlePoints = `${next?.trainer?.battlePoints ?? 0}`;
		gender = next?.trainer?.gender ?? 'Male';
	}

	async function refreshState() {
		try {
			error = null;
			snapshot = await bridgeClient.getState();
			syncTrainerForm(snapshot);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not reach the PKHeX bridge.';
		}
	}

	async function handleFileSelection(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			busyLabel = `Loading ${file.name}`;
			const base64 = await bridgeClient.fileToBase64(file);
			snapshot = await bridgeClient.loadSave(file.name, base64);
			syncTrainerForm(snapshot);
			notice = `${file.name} loaded.`;
			error = null;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Failed to load save file.';
		} finally {
			busyLabel = null;
			input.value = '';
		}
	}

	async function loadDemo() {
		try {
			busyLabel = 'Loading demo save';
			const response = await fetch(demoSaveUrl);
			const bytes = new Uint8Array(await response.arrayBuffer());
			snapshot = await bridgeClient.loadSave('savedata_1.sav', bridgeClient.bytesToBase64(bytes));
			syncTrainerForm(snapshot);
			notice = 'Demo save loaded.';
			error = null;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load demo save.';
		} finally {
			busyLabel = null;
		}
	}

	async function exportSave() {
		try {
			busyLabel = 'Preparing export';
			const exported = await bridgeClient.exportSave();
			bridgeClient.downloadBase64File(exported.base64, exported.fileName);
			notice = `${exported.fileName} exported.`;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Failed to export save.';
		} finally {
			busyLabel = null;
		}
	}

	async function saveTrainer() {
		try {
			busyLabel = 'Updating trainer';
			snapshot = await bridgeClient.updateTrainer({
				money: Number.parseInt(money, 10) || 0,
				battlePoints: snapshot?.trainer?.battlePoints == null ? null : Number.parseInt(battlePoints, 10) || 0,
				gender
			});
			notice = 'Trainer values updated in the loaded save.';
			error = null;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not update trainer.';
		} finally {
			busyLabel = null;
		}
	}

	async function runQuickAction(pluginId: string, hookType: string) {
		try {
			busyLabel = 'Running plug-in action';
			const result = await bridgeClient.runQuickAction(pluginId, hookType);
			if (result.type === 'notification') {
				notice = result.notification.description ?? result.notification.message;
				return;
			}

			if (result.type === 'pluginPage') {
				await goto(`/plugins/${result.pluginPage.pluginId}/${result.pluginPage.path}`);
				return;
			}

			notice = 'Plug-in action completed.';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Quick action failed.';
		} finally {
			busyLabel = null;
		}
	}
</script>

<input bind:this={fileInput} type="file" class="hidden" onchange={handleFileSelection} />

<AntPageHeader title="Home" description="Open a save file, update trainer values, and run quick plug-in actions.">
	{#snippet extra()}
		<Button variant="default" href="/plugins">Manage plug-ins</Button>
		<Button variant="primary" onclick={() => fileInput?.click()}>{snapshot?.loaded ? 'Open another save' : 'Open save file'}</Button>
	{/snippet}
</AntPageHeader>

{#if error}
	<AntAlert tone="error">{error}</AntAlert>
{/if}

{#if notice}
	<AntAlert tone="success">{notice}</AntAlert>
{/if}


<div class="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
	<Panel
		title={snapshot?.loaded ? 'Loaded save' : 'Start here'}
		description={
			snapshot?.loaded
				? 'The bridge runtime has a save loaded and ready for export, plug-ins, and first-pass edits.'
				: 'Use a local save file or load the demo save to exercise the new Svelte shell.'
		}
	>
		{#if snapshot?.loaded}
			<ResponsibleDescriptions>
				<AntDescriptionItem label="File">{snapshot.fileName}</AntDescriptionItem>
				<AntDescriptionItem label="Version">{snapshot.gameVersion}</AntDescriptionItem>
			</ResponsibleDescriptions>

			<div class="flex flex-wrap gap-3">
				<Button variant="primary" onclick={exportSave}>Export save</Button>
				<Button variant="default" onclick={() => fileInput?.click()}>Open another save</Button>
			</div>
		{:else}
			<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
				<Button variant="primary" onclick={() => fileInput?.click()}>Open local save</Button>
				<Button variant="default" onclick={loadDemo}>Load demo save</Button>
			</div>
		{/if}
	</Panel>

	<Panel title="Runtime" description="Phase 1 keeps the PKHeX engine and plug-in host behind a bridge while the first-party UI moves to Svelte.">
		<dl class="space-y-3 text-sm text-slate-600 dark:text-slate-300">
			<div class="flex items-center justify-between gap-3">
				<dt>Bridge status</dt>
				<dd class="font-medium text-slate-900 dark:text-slate-100">Connected</dd>
			</div>
			<div class="flex items-center justify-between gap-3">
				<dt>Theme</dt>
				<dd class="font-medium text-slate-900 dark:text-slate-100">Light + dark</dd>
			</div>
			<div class="flex items-center justify-between gap-3">
				<dt>Package manager</dt>
				<dd class="font-medium text-slate-900 dark:text-slate-100">pnpm</dd>
			</div>
		</dl>

		{#if busyLabel}
			<div class="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-900/80 dark:bg-sky-950/40 dark:text-sky-200">
				{busyLabel}...
			</div>
		{/if}
	</Panel>
</div>

{#if snapshot?.trainer}
	<Panel title="Trainer">
		<ResponsibleDescriptions title="Trainer">
			<AntDescriptionItem label="TID/SID">{snapshot.trainer.id}</AntDescriptionItem>
			<AntDescriptionItem label="Name">
				<input class="ant-field ant-input-readonly" value={snapshot.trainer.name} readonly />
			</AntDescriptionItem>
			<AntDescriptionItem label="Gender">
				<GenderSelector value={gender as 'Male' | 'Female' | 'Genderless'} onchange={(next) => (gender = next)} />
			</AntDescriptionItem>
			<AntDescriptionItem label="Cash">
				<input class="ant-field" bind:value={money} inputmode="numeric" />
			</AntDescriptionItem>
			{#if snapshot.trainer.battlePoints != null}
				<AntDescriptionItem label="Battle Points">
					<input class="ant-field" bind:value={battlePoints} inputmode="numeric" />
				</AntDescriptionItem>
			{/if}
			<AntDescriptionItem label="Rival">
				<input class="ant-field ant-input-readonly" value={snapshot.trainer.rivalName ?? 'N/A'} readonly />
			</AntDescriptionItem>
		</ResponsibleDescriptions>

		<div class="flex flex-wrap gap-3">
			<Button variant="primary" onclick={saveTrainer}>Apply trainer changes</Button>
		</div>
	</Panel>
{/if}

{#if snapshot?.quickActions?.length}
	<Panel title="Quick actions" description="Installed plug-ins can still register actions in the new shell. Actions that open pages hand off to the persistent Blazor host only when needed.">
		<div class="flex flex-wrap gap-2">
			{#each snapshot.quickActions as action (action.hookType)}
				<Button
					variant="link"
					disabled={action.disabled}
					onclick={() => runQuickAction(action.pluginId, action.hookType)}
				>
					{action.label}
				</Button>
			{/each}
		</div>
	</Panel>
{/if}
