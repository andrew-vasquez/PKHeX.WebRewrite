<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		void goto('/');
	});
</script>

<p class="text-sm text-slate-500 dark:text-slate-300">Redirecting to the save workspace...</p>
