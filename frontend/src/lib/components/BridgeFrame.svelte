<script lang="ts">
	import { onMount } from 'svelte';
	import { bridgeClient } from '$lib/bridge/client';

	let { visible = false } = $props<{ visible?: boolean }>();

	let frame = $state<HTMLIFrameElement | null>(null);

	onMount(() => {
		bridgeClient.setFrame(frame);
		return () => bridgeClient.setFrame(null);
	});
</script>

<iframe
	bind:this={frame}
	title="PKHeX bridge"
	src={bridgeClient.url}
	class={[
		'border-0 bg-transparent transition-[opacity,transform,width,height,inset] duration-200 ease-out',
		visible
			? 'pointer-events-auto fixed inset-x-0 bottom-0 top-[4.5rem] z-40 h-[calc(100dvh-4.5rem)] w-full opacity-100'
			: 'pointer-events-none fixed -left-full top-0 h-px w-px opacity-0'
	]}
></iframe>
