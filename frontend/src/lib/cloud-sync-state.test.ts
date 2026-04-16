import { describe, expect, it } from 'vitest';
import { parseSyncMap, withSyncedId, withoutSyncedId } from './cloud-sync-state';

describe('cloud sync state helpers', () => {
	it('parses invalid storage safely', () => {
		expect(parseSyncMap('not-json')).toEqual({});
	});

	it('adds and removes synced ids immutably', () => {
		const added = withSyncedId({}, 'local-1', 'cloud-1');
		expect(added).toEqual({ 'local-1': 'cloud-1' });
		expect(withoutSyncedId(added, 'local-1')).toEqual({});
	});
});
