export type SyncMap = Record<string, string>;

export function parseSyncMap(raw: string | null): SyncMap {
	if (!raw) return {};
	try {
		return JSON.parse(raw) as SyncMap;
	} catch {
		return {};
	}
}

export function withSyncedId(map: SyncMap, localUniqueId: string, cloudId: string): SyncMap {
	return { ...map, [localUniqueId]: cloudId };
}

export function withoutSyncedId(map: SyncMap, localUniqueId: string): SyncMap {
	const next = { ...map };
	delete next[localUniqueId];
	return next;
}
