export const themeKey = 'theme';

export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	return window.localStorage.getItem(themeKey) === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;

	document.documentElement.classList.toggle('dark', theme === 'dark');
	document.documentElement.style.colorScheme = theme;

	if (typeof window !== 'undefined') {
		window.localStorage.setItem(themeKey, theme);
	}
}
