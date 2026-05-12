const browserTheme = 'theme';

// Checks the browser's local storage for the user's theme preference, or defaults to 'light' if not set 
function getTheme() {
  	return localStorage.getItem(browserTheme) || 'light';
}

// Applies the theme, then saves it
function applyTheme(theme) {
	document.documentElement.classList.toggle( // Adds or removes the 'dark' class on the stylesheet
		'dark',
		theme === 'dark'
	);
  	localStorage.setItem(browserTheme, theme); // Save the user's theme preference in local storage
}

// Switches the theme to the opposite of the current theme
function toggleTheme() {
  	const currentTheme = getTheme();
  	applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

applyTheme(getTheme());

// Adds event listener to the theme toggle button
const button = document.getElementById('themeToggle');
button?.addEventListener('click', toggleTheme);