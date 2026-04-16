export function normalizePluginSourceUrl(sourceUrl: string) {
	const trimmed = sourceUrl.trim();
	if (!trimmed) return '';
	return trimmed.endsWith('pkhexwebplugins.json') ? trimmed : `${trimmed.replace(/\/+$/, '')}/pkhexwebplugins.json`;
}
