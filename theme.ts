
type Theme = "light" | 'dark';

const browserTheme = 'theme';

export function getTheme(): Theme {
  	return (localStorage.getItem(browserTheme) as Theme) || 'light';
}

export function applyTheme(theme: Theme): void {
	document.documentElement.classList.toggle(
		'dark',
		theme === 'dark'
	);
  	localStorage.setItem(browserTheme, theme);
}

export function toggleTheme(): void {
  	const currentTheme = getTheme();
  	applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

applyTheme(getTheme());
