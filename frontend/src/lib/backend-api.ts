export const backendApiUrl = (import.meta.env.PUBLIC_PKHEX_BACKEND_API_URL as string | undefined) ?? 'http://localhost:5031';

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
