export const backendApiUrl = (import.meta.env.PUBLIC_PKHEX_BACKEND_API_URL as string | undefined) ?? '/backend-api';

export function backendUrl(path: string) {
	return `${backendApiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function fetchJson<T>(path: string, init?: RequestInit) {
	const response = await fetch(backendUrl(path), init);
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}.`);
	}
	return (await response.json()) as T;
}

export async function fetchBytes(path: string, init?: RequestInit) {
	const response = await fetch(backendUrl(path), init);
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}.`);
	}
	return new Uint8Array(await response.arrayBuffer());
}

export async function postJson<T>(path: string, body: unknown, init?: RequestInit) {
	return fetchJson<T>(path, {
		method: 'POST',
		headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
		body: JSON.stringify(body),
		...init
	});
}

export async function deleteRequest(path: string, init?: RequestInit) {
	const response = await fetch(backendUrl(path), { method: 'DELETE', ...init });
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}.`);
	}
}

export async function uploadFile<T>(path: string, bytes: Uint8Array, fileName: string, method: 'POST' | 'PUT' = 'POST', init?: RequestInit) {
	const form = new FormData();
	const data = bytes as unknown as BlobPart;
	form.append('file', new Blob([data]), fileName);
	const response = await fetch(backendUrl(path), {
		method,
		body: form,
		...init
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}.`);
	}
	return (await response.json()) as T;
}
