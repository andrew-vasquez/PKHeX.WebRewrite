<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { bridgeClient, type BridgeSnapshot } from '$lib/bridge/client';
	import BridgeFrame from '$lib/components/BridgeFrame.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import { applyTheme, getStoredTheme } from '$lib/theme';

	let { children } = $props();
	let mobileNavOpen = $state(false);
	let snapshot = $state<BridgeSnapshot | null>(null);
	let darkTheme = $state(false);

	let isPluginHostRoute = $derived(/^\/plugins\/[^/]+\/[^/]+$/.test(page.url.pathname));
	let primaryNavItems = [
		{ href: '/', label: 'Home' },
		{ href: '/plugins', label: 'Plug-ins' },
		{ href: '/settings', label: 'Settings' }
	];
	let loadedNavItems = [
		{ href: '/party', label: 'Party' },
		{ href: '/pokemon-box', label: 'Box' },
		{ href: '/items', label: 'Items' },
		{ href: '/save', label: 'Export' }
	];

	let bridgeBaseUrl = $derived(bridgeClient.url.replace(/\/bridge$/, ''));
	let navItems = $derived(snapshot?.loaded ? [...primaryNavItems, ...loadedNavItems] : primaryNavItems);

	onMount(() => {
		darkTheme = getStoredTheme() === 'dark';
		applyTheme(darkTheme ? 'dark' : 'light');
		void refreshSnapshot();

		const handleFocus = () => {
			void refreshSnapshot();
		};
		const handleStateChanged = () => {
			void refreshSnapshot();
		};

		window.addEventListener('focus', handleFocus);
		window.addEventListener('pageshow', handleFocus);
		window.addEventListener('pkhex:state-changed', handleStateChanged);

		return () => {
			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('pageshow', handleFocus);
			window.removeEventListener('pkhex:state-changed', handleStateChanged);
		};
	});

	async function refreshSnapshot() {
		try {
			snapshot = await bridgeClient.getState();
		} catch {
			snapshot = null;
		}
	}

	function updateTheme(enabled: boolean) {
		darkTheme = enabled;
		applyTheme(enabled ? 'dark' : 'light');
	}

	function toggleMobileNav() {
		mobileNavOpen = !mobileNavOpen;
	}

	function closeMobileNav() {
		mobileNavOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href={`${bridgeBaseUrl}/_content/AntDesign/css/ant-design-blazor.css`} />
	<script>
		const theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark', theme === 'dark');
		document.documentElement.style.colorScheme = theme;
	</script>
	<title>PKHeX for Web</title>
</svelte:head>

<div class="pkhex-app ant-layout min-h-dvh bg-[var(--pkh-shell-bg)] text-slate-950 dark:text-slate-50">
	<div class="ant-layout flex min-h-dvh flex-col lg:flex-row">
		<aside class="ant-layout-sider hidden w-50 shrink-0 border-r border-[var(--pkh-shell-sidebar-divider)] bg-[var(--pkh-shell-sidebar)] text-[var(--pkh-shell-sidebar-text)] lg:flex lg:flex-col">
			<div class="px-4 py-4 text-center text-[var(--pkh-shell-sidebar-text)]">
				<div class="text-base font-medium">PKHeX.Web</div>
			</div>

			<nav class="ant-menu ant-menu-dark flex-1 space-y-1 px-2 py-2">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class={[
							'block rounded-md px-4 py-2.5 text-sm transition-colors',
							page.url.pathname === item.href
								? 'bg-[var(--pkh-shell-primary)] text-white'
								: 'text-[var(--pkh-shell-sidebar-text-muted)] hover:bg-[var(--pkh-shell-sidebar-hover)] hover:text-[var(--pkh-shell-sidebar-text)]'
						]}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="border-t border-[var(--pkh-shell-sidebar-divider)] px-4 py-4">
				<div class="flex items-center justify-between gap-3 text-sm text-[var(--pkh-shell-sidebar-text-muted)]">
					<span>{darkTheme ? 'Dark' : 'Light'} mode</span>
					<Switch checked={darkTheme} onchange={updateTheme} />
				</div>
			</div>
		</aside>

		<div class="ant-layout flex min-h-dvh flex-1 flex-col">
			<header class="sticky top-0 z-30 border-b border-[var(--pkh-shell-border)] bg-[var(--pkh-shell-panel)] lg:hidden">
				<div class="flex items-center justify-between gap-3 px-4 py-3">
					<div class="flex items-center gap-3">
						<Button class="min-w-0 px-3" variant="default" onclick={toggleMobileNav}>Menu</Button>
						<p class="text-sm font-semibold text-slate-900 dark:text-slate-50">PKHeX.Web</p>
					</div>

					<div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
						<span>{darkTheme ? 'Dark' : 'Light'}</span>
						<Switch checked={darkTheme} onchange={updateTheme} />
					</div>
				</div>
			</header>

			{#if mobileNavOpen}
				<button
					type="button"
					class="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] lg:hidden"
					onclick={closeMobileNav}
					aria-label="Close navigation"
					transition:fade={{ duration: 160 }}
				></button>

				<aside
					class="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-[var(--pkh-shell-sidebar-divider)] bg-[var(--pkh-shell-sidebar)] text-[var(--pkh-shell-sidebar-text)] shadow-xl lg:hidden"
					transition:fly={{ x: -24, duration: 180 }}
				>
					<div class="flex items-center justify-between px-4 py-4 text-[var(--pkh-shell-sidebar-text)]">
						<div class="text-base font-medium">PKHeX.Web</div>
						<Button class="min-w-0 px-3" variant="default" onclick={closeMobileNav}>Close</Button>
					</div>

					<nav class="ant-menu flex-1 space-y-1 px-2 py-2">
						{#each navItems as item (item.href)}
							<a
								href={item.href}
								class={[
									'block rounded-md px-4 py-2.5 text-sm transition-colors',
									page.url.pathname === item.href
										? 'bg-[var(--pkh-shell-primary)] text-white'
										: 'text-[var(--pkh-shell-sidebar-text-muted)] hover:bg-[var(--pkh-shell-sidebar-hover)] hover:text-[var(--pkh-shell-sidebar-text)]'
								]}
								onclick={closeMobileNav}
							>
								{item.label}
							</a>
						{/each}
					</nav>

					<div class="border-t border-[var(--pkh-shell-sidebar-divider)] px-4 py-4">
						<div class="flex items-center justify-between gap-3 text-sm text-[var(--pkh-shell-sidebar-text-muted)]">
							<span>{darkTheme ? 'Dark' : 'Light'} mode</span>
							<Switch checked={darkTheme} onchange={updateTheme} />
						</div>
					</div>
				</aside>
			{/if}

			<main class="flex-1 px-4 py-4 sm:px-6 lg:px-4 lg:py-6">
				<div class="mx-auto flex w-full max-w-7xl flex-col gap-6">{@render children()}</div>
			</main>
		</div>
	</div>

	<BridgeFrame visible={isPluginHostRoute} />
</div>
