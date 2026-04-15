<script lang="ts">
	let { typeId } = $props<{ typeId: number }>();

	const types = [
		{ name: 'Normal', color: '#a8a77a' },
		{ name: 'Fighting', color: '#c22e28' },
		{ name: 'Flying', color: '#a98ff3' },
		{ name: 'Poison', color: '#a33ea1' },
		{ name: 'Ground', color: '#e2bf65' },
		{ name: 'Rock', color: '#b6a136' },
		{ name: 'Bug', color: '#a6b91a' },
		{ name: 'Ghost', color: '#735797' },
		{ name: 'Steel', color: '#b7b7ce' },
		{ name: 'Fire', color: '#ee8130' },
		{ name: 'Water', color: '#6390f0' },
		{ name: 'Grass', color: '#7ac74c' },
		{ name: 'Electric', color: '#f7d02c' },
		{ name: 'Psychic', color: '#f95587' },
		{ name: 'Ice', color: '#96d9d6' },
		{ name: 'Dragon', color: '#6f35fc' },
		{ name: 'Dark', color: '#705746' },
		{ name: 'Fairy', color: '#d685ad' }
	];

	let type = $derived(types[typeId] ?? { name: `Type ${typeId}`, color: '#64748b' });
</script>

<span class="inline-flex min-w-20 items-center justify-center rounded border border-black/15 px-2 py-1 text-[10px] uppercase text-white shadow-[2px_2px_0_rgba(15,23,42,0.18)]" style={`background:${type.color}`}>
	{type.name}
</span>
