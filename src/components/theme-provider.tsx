"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	applyThemeModeToRoot,
	resolveThemeMode,
	type ThemeMode,
} from "@/lib/theme";
import { THEME_STORAGE_KEY } from "@/lib/app-config";

type ThemeContextValue = {
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialMode(): ThemeMode {
	if (typeof window === "undefined") return "system";
	return resolveThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [mode, setModeState] = useState<ThemeMode>(readInitialMode);

	const applyThemeMode = useCallback((nextMode: ThemeMode) => {
		applyThemeModeToRoot(
			document.documentElement,
			nextMode,
			window.matchMedia("(prefers-color-scheme: dark)").matches,
		);
	}, []);

	useEffect(() => {
		applyThemeMode(mode);
	}, [applyThemeMode, mode]);

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => {
			if (mode === "system") applyThemeMode("system");
		};
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [applyThemeMode, mode]);

	const setMode = useCallback(
		(nextMode: ThemeMode) => {
			setModeState(nextMode);
			window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
			applyThemeMode(nextMode);
		},
		[applyThemeMode],
	);

	const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useThemeMode() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useThemeMode must be used inside ThemeProvider");
	}
	return context;
}
