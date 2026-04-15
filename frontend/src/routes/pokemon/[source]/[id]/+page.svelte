<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { PokemonDetails, PokemonStats, SavePokemonPayload } from '$lib/bridge/client';
	import { bridgeClient } from '$lib/bridge/client';
	import AntAlert from '$lib/components/ant/AntAlert.svelte';
	import AntDescriptionItem from '$lib/components/ant/AntDescriptionItem.svelte';
	import AntDescriptions from '$lib/components/ant/AntDescriptions.svelte';
	import AntPageHeader from '$lib/components/ant/AntPageHeader.svelte';
	import GenderSelector from '$lib/components/pkhex/GenderSelector.svelte';
	import PokemonSprite from '$lib/components/pkhex/PokemonSprite.svelte';
	import PokemonTypeBadge from '$lib/components/pkhex/PokemonTypeBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Panel from '$lib/components/ui/Panel.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';

	type Tab = 'description' | 'moves' | 'stats' | 'met' | 'trainer';
	type DraftPokemon = SavePokemonPayload['pokemon'];

	let details = $state<PokemonDetails | null>(null);
	let draft = $state<DraftPokemon | null>(null);
	let error = $state<string | null>(null);
	let notice = $state<string | null>(null);
	let saving = $state(false);
	let activeTab = $state<Tab>('description');

	let source = $derived(page.params.source as 'party' | 'box' | 'draft');
	let uniqueId = $derived(page.params.id);
	let draftTarget = $derived((page.url.searchParams.get('target') as 'party' | 'box' | null) ?? 'box');
	let tabs: Array<{ id: Tab; label: string }> = [
		{ id: 'description', label: 'Description' },
		{ id: 'moves', label: 'Moves' },
		{ id: 'stats', label: 'Stats' },
		{ id: 'met', label: 'Met' },
		{ id: 'trainer', label: 'Trainer' }
	];

	onMount(() => {
		void load();
	});

	function cloneStats(stats: PokemonStats): PokemonStats {
		return { ...stats };
	}

	function createDraft(next: PokemonDetails): DraftPokemon {
		return {
			nickname: next.pokemon.nickname,
			level: next.pokemon.level,
			shiny: next.pokemon.shiny,
			gender: next.pokemon.gender,
			friendship: next.pokemon.friendship,
			nature: next.pokemon.nature,
			heldItemId: next.pokemon.heldItemId,
			abilityId: next.pokemon.abilityId,
			formId: next.pokemon.formId,
			moveIds: next.pokemon.moves.map((move) => move.id),
			evs: cloneStats(next.pokemon.evs),
			ivs: cloneStats(next.pokemon.ivs),
			metBallId: next.pokemon.metBallId,
			metLocationId: next.pokemon.metLocationId,
			metLevel: next.pokemon.metLevel,
			metDate: next.pokemon.metDate ?? '',
			fatefulEncounter: next.pokemon.fatefulEncounter,
			trainer: { ...next.pokemon.trainer }
		};
	}

	function applyDetails(next: PokemonDetails) {
		details = next;
		draft = createDraft(next);
	}

	async function load() {
		try {
			if (!uniqueId) return;
			error = null;
			notice = null;
			const next = await bridgeClient.getPokemon(source, uniqueId);
			applyDetails(next);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not load Pokemon.';
		}
	}

	async function savePokemon() {
		if (!details || !draft) return;

		try {
			saving = true;
			error = null;
			const next = await bridgeClient.savePokemon({
				source,
				uniqueId: details.pokemon.uniqueId,
				pokemon: {
					...draft,
					metDate: draft.metDate?.trim() ? draft.metDate : null
				}
			});
			applyDetails(next);
			notice = `${next.pokemon.displayName} saved.`;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not save Pokemon changes.';
		} finally {
			saving = false;
		}
	}

	async function primaryAction() {
		if (source === 'draft') {
			if (!details || !draft) return;
			try {
				saving = true;
				error = null;
				await bridgeClient.savePokemon({
					source,
					uniqueId: details.pokemon.uniqueId,
					pokemon: {
						...draft,
						metDate: draft.metDate?.trim() ? draft.metDate : null
					}
				});
				const result = await bridgeClient.addDraftPokemonToCollection(draftTarget);
				notice = `${result.displayName} added to the ${result.source}.`;
				await goto(`/pokemon/${result.source}/${result.uniqueId}`);
			} catch (reason) {
				error = reason instanceof Error ? reason.message : 'Could not add Pokemon to the box.';
			} finally {
				saving = false;
			}
			return;
		}

		await savePokemon();
	}

	async function exportPokemon() {
		if (!details) return;
		const exported = await bridgeClient.exportPokemon(details.pokemon.uniqueId);
		bridgeClient.downloadBase64File(exported.base64, exported.fileName);
	}

	async function copyShowdown() {
		if (!details) return;
		await navigator.clipboard.writeText(details.pokemon.showdown);
		notice = 'Copied Showdown export.';
	}

	function updateMove(index: number, value: string) {
		if (!draft) return;
		draft.moveIds[index] = Number.parseInt(value, 10) || 0;
	}

	function updateStat(group: 'evs' | 'ivs', stat: keyof PokemonStats, value: string) {
		if (!draft) return;
		draft[group][stat] = Number.parseInt(value, 10) || 0;
	}

	function tabClass(tab: Tab) {
		return activeTab === tab
			? 'bg-[var(--pkh-shell-primary)] text-white'
			: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
	}
</script>

<AntPageHeader title={details?.pokemon.displayName ?? 'Pokemon'} description={source === 'draft' ? 'Finish the imported, cloned, or encounter-generated Pokemon and add it to the box.' : 'Edit the loaded Pokemon while keeping the current Svelte shell and bridge-backed PKHeX runtime.'}>
	{#snippet extra()}
		{#if details}
			<div class="mr-3 flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
				<PokemonSprite speciesId={details.pokemon.speciesId} shiny={details.pokemon.shiny} alt={details.pokemon.displayName} size="md" />
			</div>
		{/if}
		<Button variant="default" onclick={load}>Reload</Button>
		{#if details && source !== 'draft'}
			<Button variant="default" href={`/pokemon/${details.pokemon.uniqueId}/clone`}>Clone</Button>
		{/if}
		<Button variant="link" onclick={copyShowdown}>Showdown</Button>
		<Button variant="default" onclick={exportPokemon}>Export *.pk</Button>
		<Button variant="primary" onclick={primaryAction} disabled={!draft || saving}>{saving ? (source === 'draft' ? 'Adding...' : 'Saving...') : source === 'draft' ? `Add to ${draftTarget}` : 'Save'}</Button>
	{/snippet}
</AntPageHeader>

{#if error}
	<AntAlert tone="error">{error}</AntAlert>
{/if}

{#if notice}
	<AntAlert tone="success">{notice}</AntAlert>
{/if}

{#if details && draft}
	<section class="grid gap-6 xl:grid-cols-[12rem_minmax(0,1fr)]">
		<div class="ant-card-shell flex flex-col items-center justify-center gap-4 p-5">
			<PokemonSprite speciesId={details.pokemon.speciesId} shiny={draft.shiny} alt={details.pokemon.displayName} size="lg" />
			<div class="flex flex-wrap justify-center gap-2">
				<PokemonTypeBadge typeId={details.pokemon.types.primary} />
				{#if details.pokemon.types.secondary != null}
					<PokemonTypeBadge typeId={details.pokemon.types.secondary} />
				{/if}
			</div>
			<div class="w-full space-y-2 text-center">
				<p class="text-base text-slate-900 dark:text-slate-50">{details.pokemon.displayName}</p>
				<p class="text-xs text-slate-500 dark:text-slate-400">PID {details.pokemon.pid} • {details.pokemon.gameVersion}</p>
				<p class={`text-xs ${details.pokemon.legality.valid ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
					{details.pokemon.legality.valid ? 'Legal' : 'Needs fixes'}
				</p>
			</div>
		</div>

		<div class="space-y-4">
	{#if details.pokemon.legality.valid}
		<AntAlert tone="success">Legal: {details.pokemon.legality.summary}</AntAlert>
	{:else}
		<div class="space-y-3">
			<AntAlert tone="error">Check legality: {details.pokemon.legality.summary}</AntAlert>
			<div class="ant-card-shell p-4">
				<p class="mb-3 text-xs uppercase text-slate-500 dark:text-slate-400">Invalid checks</p>
				<ul class="space-y-2 text-sm text-slate-700 dark:text-slate-200">
					{#each details.pokemon.legality.issues as issue (`${issue.code}:${issue.message}`)}
						<li><span class="text-rose-600 dark:text-rose-300">{issue.code}</span>: {issue.message}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		{#each tabs as tab (tab.id)}
			<button type="button" class={`ant-btn px-4 py-2 text-sm ${tabClass(tab.id)}`} onclick={() => (activeTab = tab.id)}>
				{tab.label}
			</button>
		{/each}
	</div>
		</div>
	</section>

	{#if activeTab === 'description'}
		<Panel title="Description" description="Core identity, battle-facing details, and export values for the selected Pokemon.">
			<AntDescriptions>
				<AntDescriptionItem label="Species">{details.pokemon.species}</AntDescriptionItem>
				<AntDescriptionItem label="PID">{details.pokemon.pid}</AntDescriptionItem>
				<AntDescriptionItem label="Nickname">
					<input class="ant-field" bind:value={draft.nickname} />
				</AntDescriptionItem>
				<AntDescriptionItem label="Level">
					<input class="ant-field" bind:value={draft.level} inputmode="numeric" />
				</AntDescriptionItem>
				<AntDescriptionItem label="Gender">
					<GenderSelector value={draft.gender as 'Male' | 'Female' | 'Genderless'} onchange={(value) => (draft!.gender = value)} />
				</AntDescriptionItem>
				<AntDescriptionItem label="Shiny">
					<div class="flex items-center gap-3">
						<Switch checked={draft.shiny} onchange={(checked) => (draft!.shiny = checked)} />
						<span>{draft.shiny ? 'Shiny' : 'Not shiny'}</span>
					</div>
				</AntDescriptionItem>
				<AntDescriptionItem label="Nature">
					<select class="ant-field" bind:value={draft.nature}>
						{#each details.editor.natures as nature (nature.value)}
							<option value={nature.value}>{nature.label}</option>
						{/each}
					</select>
				</AntDescriptionItem>
				{#if details.editor.forms.length > 1}
					<AntDescriptionItem label="Form">
						<select class="ant-field" bind:value={draft.formId}>
							{#each details.editor.forms as form (form.id)}
								<option value={form.id}>{form.name}</option>
							{/each}
						</select>
					</AntDescriptionItem>
				{/if}
				<AntDescriptionItem label="Ability">
					<select class="ant-field" bind:value={draft.abilityId}>
						{#each details.editor.abilities as ability (ability.id)}
							<option value={ability.id}>{ability.name}</option>
						{/each}
					</select>
				</AntDescriptionItem>
				<AntDescriptionItem label="Held Item">
					<select class="ant-field" bind:value={draft.heldItemId}>
						{#each details.editor.heldItems as item (item.id)}
							<option value={item.id}>{item.name}</option>
						{/each}
					</select>
				</AntDescriptionItem>
				<AntDescriptionItem label="Friendship">
					<input class="ant-field" bind:value={draft.friendship} inputmode="numeric" />
				</AntDescriptionItem>
			</AntDescriptions>

			<div>
				<label for="showdown-output" class="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">Showdown</label>
				<textarea id="showdown-output" class="ant-textarea" readonly value={details.pokemon.showdown}></textarea>
			</div>
		</Panel>
	{/if}

	{#if activeTab === 'moves'}
		<Panel title="Moves" description="Edit the active moveset using the legal move list returned by the current PKHeX runtime.">
			<div class="grid gap-4 md:grid-cols-2">
				{#each details.pokemon.moves as move, index (move.slot)}
					<AntDescriptions title={move.slot} columns="md:grid-cols-1">
						<AntDescriptionItem label="Battle">
							<div class="flex flex-wrap gap-2">
								<PokemonTypeBadge typeId={move.typeId} />
								{#if move.isDummied}
									<span class="inline-flex items-center rounded border border-amber-400 bg-amber-100 px-2 py-1 text-[10px] uppercase text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">Unusable</span>
								{/if}
							</div>
						</AntDescriptionItem>
						<AntDescriptionItem label="Move">
							<select class="ant-field" value={draft.moveIds[index]} onchange={(event) => updateMove(index, (event.currentTarget as HTMLSelectElement).value)}>
								{#each details.editor.moves as option (option.id)}
									<option value={option.id}>{option.name}</option>
								{/each}
							</select>
						</AntDescriptionItem>
						<AntDescriptionItem label="Current PP">{move.pp}</AntDescriptionItem>
						<AntDescriptionItem label="Max PP">{move.maxPp}</AntDescriptionItem>
					</AntDescriptions>
				{/each}
			</div>
		</Panel>
	{/if}

	{#if activeTab === 'stats'}
		<Panel title="Stats" description="Current computed stats are shown separately from editable EV and IV values.">
			<div class="grid gap-6 xl:grid-cols-3">
				<AntDescriptions title="Current" columns="md:grid-cols-1">
					<AntDescriptionItem label="HP">{details.pokemon.stats.hp}</AntDescriptionItem>
					<AntDescriptionItem label="Atk">{details.pokemon.stats.atk}</AntDescriptionItem>
					<AntDescriptionItem label="Def">{details.pokemon.stats.def}</AntDescriptionItem>
					<AntDescriptionItem label="SpA">{details.pokemon.stats.spa}</AntDescriptionItem>
					<AntDescriptionItem label="SpD">{details.pokemon.stats.spd}</AntDescriptionItem>
					<AntDescriptionItem label="Spe">{details.pokemon.stats.spe}</AntDescriptionItem>
				</AntDescriptions>
				<AntDescriptions title="EVs" columns="md:grid-cols-1">
					<AntDescriptionItem label="HP"><input class="ant-field" value={draft.evs.hp} inputmode="numeric" onchange={(event) => updateStat('evs', 'hp', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="Atk"><input class="ant-field" value={draft.evs.atk} inputmode="numeric" onchange={(event) => updateStat('evs', 'atk', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="Def"><input class="ant-field" value={draft.evs.def} inputmode="numeric" onchange={(event) => updateStat('evs', 'def', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="SpA"><input class="ant-field" value={draft.evs.spa} inputmode="numeric" onchange={(event) => updateStat('evs', 'spa', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="SpD"><input class="ant-field" value={draft.evs.spd} inputmode="numeric" onchange={(event) => updateStat('evs', 'spd', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="Spe"><input class="ant-field" value={draft.evs.spe} inputmode="numeric" onchange={(event) => updateStat('evs', 'spe', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
				</AntDescriptions>
				<AntDescriptions title="IVs" columns="md:grid-cols-1">
					<AntDescriptionItem label="HP"><input class="ant-field" value={draft.ivs.hp} inputmode="numeric" onchange={(event) => updateStat('ivs', 'hp', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="Atk"><input class="ant-field" value={draft.ivs.atk} inputmode="numeric" onchange={(event) => updateStat('ivs', 'atk', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="Def"><input class="ant-field" value={draft.ivs.def} inputmode="numeric" onchange={(event) => updateStat('ivs', 'def', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="SpA"><input class="ant-field" value={draft.ivs.spa} inputmode="numeric" onchange={(event) => updateStat('ivs', 'spa', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="SpD"><input class="ant-field" value={draft.ivs.spd} inputmode="numeric" onchange={(event) => updateStat('ivs', 'spd', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
					<AntDescriptionItem label="Spe"><input class="ant-field" value={draft.ivs.spe} inputmode="numeric" onchange={(event) => updateStat('ivs', 'spe', (event.currentTarget as HTMLInputElement).value)} /></AntDescriptionItem>
				</AntDescriptions>
			</div>
		</Panel>
	{/if}

	{#if activeTab === 'met'}
		<Panel title="Met Conditions" description="Capture details and encounter metadata copied from the original Razor editor flow.">
			<AntDescriptions>
				<AntDescriptionItem label="Origin Game">{details.pokemon.gameVersion}</AntDescriptionItem>
				<AntDescriptionItem label="Location">
					<select class="ant-field" bind:value={draft.metLocationId}>
						{#each details.editor.locations as location (location.id)}
							<option value={location.id}>{location.name}</option>
						{/each}
					</select>
				</AntDescriptionItem>
				<AntDescriptionItem label="Captured With">
					<select class="ant-field" bind:value={draft.metBallId}>
						{#each details.editor.balls as ball (ball.id)}
							<option value={ball.id}>{ball.name}</option>
						{/each}
					</select>
				</AntDescriptionItem>
				<AntDescriptionItem label="Met Level">
					<input class="ant-field" bind:value={draft.metLevel} inputmode="numeric" />
				</AntDescriptionItem>
				<AntDescriptionItem label="Date">
					<input class="ant-field" bind:value={draft.metDate} type="date" />
				</AntDescriptionItem>
				<AntDescriptionItem label="Fateful Encounter">
					<div class="flex items-center gap-3">
						<Switch checked={draft.fatefulEncounter} onchange={(checked) => (draft!.fatefulEncounter = checked)} />
						<span>{draft.fatefulEncounter ? 'Enabled' : 'Disabled'}</span>
					</div>
				</AntDescriptionItem>
			</AntDescriptions>
		</Panel>
	{/if}

	{#if activeTab === 'trainer'}
		<Panel title="Trainer" description="Original trainer and current handler data from the PKHeX ownership model.">
			<div class="grid gap-6 xl:grid-cols-2">
				<AntDescriptions title="Handler" columns="md:grid-cols-1">
					<AntDescriptionItem label="Current Handler">
						<select class="ant-field" bind:value={draft.trainer.currentHandler}>
							<option value="OriginalTrainer">OT</option>
							<option value="SomeoneElse">Other</option>
						</select>
					</AntDescriptionItem>
				</AntDescriptions>

				<AntDescriptions title={draft.trainer.currentHandler === 'OriginalTrainer' ? 'Original Trainer Active' : 'Current Handler Active'} columns="md:grid-cols-1">
					<AntDescriptionItem label="TID">
						<input class="ant-field" bind:value={draft.trainer.tid} inputmode="numeric" />
					</AntDescriptionItem>
					<AntDescriptionItem label="SID">
						<input class="ant-field" bind:value={draft.trainer.sid} inputmode="numeric" />
					</AntDescriptionItem>
					<AntDescriptionItem label="OT Name">
						<input class="ant-field" bind:value={draft.trainer.name} />
					</AntDescriptionItem>
					<AntDescriptionItem label="OT Gender">
						<GenderSelector value={draft.trainer.gender as 'Male' | 'Female' | 'Genderless'} onchange={(value) => (draft!.trainer.gender = value)} />
					</AntDescriptionItem>
					<AntDescriptionItem label="Handler Name">
						<input class="ant-field" bind:value={draft.trainer.handlingTrainerName} />
					</AntDescriptionItem>
					<AntDescriptionItem label="Handler Gender">
						<GenderSelector value={draft.trainer.handlingTrainerGender as 'Male' | 'Female' | 'Genderless'} onchange={(value) => (draft!.trainer.handlingTrainerGender = value)} />
					</AntDescriptionItem>
				</AntDescriptions>
			</div>
		</Panel>
	{/if}

	<Panel title="Cloud" description="Cloud sync and public sharing still depend on the existing backend API flows. The Svelte shell keeps the route surface, while sync-heavy toggles remain a follow-up parity pass.">
		<div class="space-y-3 text-sm text-slate-600 dark:text-slate-300">
			<p>Current source: <span class="text-slate-900 dark:text-slate-100">{source}</span></p>
			<p>Use the cloud pages when the backend API is running and authenticated.</p>
			<div class="flex flex-wrap gap-3">
				<Button variant="default" href="/cloud/pokemon">Open cloud list</Button>
				<Button variant="default" href="/plugins">Plug-in sync tools</Button>
			</div>
		</div>
	</Panel>
{/if}
