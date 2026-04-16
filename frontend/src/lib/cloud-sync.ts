import { browser } from '$app/environment';
import { deleteRequest, fetchJson, postJson, uploadFile } from '$lib/backend-api';
import { parseSyncMap, withSyncedId, withoutSyncedId } from '$lib/cloud-sync-state';

const storageKey = 'pkhex:synced-pokemon';

export type CloudPokemonMetadata = {
	id: string;
	species: string;
	nickname: string;
	level: number;
	nature: string;
	ability: string;
	isPublic: boolean;
	allowDownload: boolean;
	uploadedAtUtc: string;
	lastSyncedAt: string;
	metConditions: {
		location: string;
		level: number;
	};
};

type SyncMap = Record<string, string>;

function readMap(): SyncMap {
	if (!browser) return {};
	return parseSyncMap(window.localStorage.getItem(storageKey));
}

function writeMap(value: SyncMap) {
	if (!browser) return;
	window.localStorage.setItem(storageKey, JSON.stringify(value));
}

export function getSyncedCloudId(localUniqueId: string) {
	return readMap()[localUniqueId] ?? null;
}

export function setSyncedCloudId(localUniqueId: string, cloudId: string) {
	writeMap(withSyncedId(readMap(), localUniqueId, cloudId));
}

export function clearSyncedCloudId(localUniqueId: string) {
	writeMap(withoutSyncedId(readMap(), localUniqueId));
}

export async function getCloudPokemon(id: string) {
	return fetchJson<CloudPokemonMetadata>(`/pokemon/${id}`, { credentials: 'include' });
}

export async function uploadCloudPokemon(localUniqueId: string, bytes: Uint8Array, fileName: string) {
	const existingId = getSyncedCloudId(localUniqueId);
	const metadata = existingId
		? await uploadFile<CloudPokemonMetadata>(`/pokemon/upload/${existingId}`, bytes, fileName, 'PUT', { credentials: 'include' })
		: await uploadFile<CloudPokemonMetadata>('/pokemon/upload', bytes, fileName, 'POST', { credentials: 'include' });

	setSyncedCloudId(localUniqueId, metadata.id);
	return metadata;
}

export async function setCloudPublic(id: string, isShared: boolean) {
	return postJson<void>(`/pokemon/share/${id}`, { isShared }, { credentials: 'include' });
}

export async function setCloudAllowDownload(id: string, isAllowed: boolean) {
	return postJson<void>(`/pokemon/allow-download/${id}`, { isAllowed }, { credentials: 'include' });
}

export async function removeCloudPokemon(localUniqueId: string, id: string) {
	await deleteRequest(`/pokemon/${id}`, { credentials: 'include' });
	clearSyncedCloudId(localUniqueId);
}
