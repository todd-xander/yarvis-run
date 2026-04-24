export type ThemeMode = "light" | "dark" | "system";

function isThemeMode(value: string | null): value is ThemeMode {
	return value === "light" || value === "dark" || value === "system";
}

export function resolveThemeMode(value: string | null): ThemeMode {
	return isThemeMode(value) ? value : "system";
}

export function applyThemeModeToRoot(
	root: HTMLElement,
	mode: ThemeMode,
	systemPrefersDark: boolean,
) {
	root.setAttribute("data-theme-mode", mode);
	root.setAttribute(
		"data-theme",
		mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode,
	);
}
