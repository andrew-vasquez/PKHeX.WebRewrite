import { describe, expect, it } from 'vitest';
import { normalizePluginSourceUrl } from './plugins';

describe('normalizePluginSourceUrl', () => {
	it('appends manifest file name for a directory url', () => {
		expect(normalizePluginSourceUrl('https://example.com/plugins')).toBe('https://example.com/plugins/pkhexwebplugins.json');
	});

	it('keeps an explicit manifest url unchanged', () => {
		expect(normalizePluginSourceUrl('https://example.com/plugins/pkhexwebplugins.json')).toBe('https://example.com/plugins/pkhexwebplugins.json');
	});
});
