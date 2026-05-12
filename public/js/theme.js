const browserTheme = 'theme';

function getTheme() {
  	return localStorage.getItem(browserTheme) || 'light';
}

function applyTheme(theme) {
	document.documentElement.classList.toggle(
		'dark',
		theme === 'dark'
	);
  	localStorage.setItem(browserTheme, theme);
}

function toggleTheme() {
  	const currentTheme = getTheme();
  	applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

applyTheme(getTheme());

// Add event listener to the dark/light mode button to toggle between the themes on click
const button = document.getElementById('themeToggle');
button?.addEventListener('click', toggleTheme);