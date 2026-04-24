"use client";

import { useThemeMode } from "@/components/theme-provider";
import type { ThemeMode } from "@/lib/theme";

const options: { value: ThemeMode; label: string }[] = [
	{ value: "system", label: "自动" },
	{ value: "light", label: "浅色" },
	{ value: "dark", label: "深色" },
];

export function ThemeToggleGroup() {
	const { mode, setMode } = useThemeMode();

	return (
		<div className="flex gap-1">
			{options.map((option) => {
				const active = option.value === mode;
				return (
					<button
						key={option.value}
						type="button"
						onClick={() => setMode(option.value)}
						className={`rounded-full px-3 py-1 text-sm transition-colors cursor-pointer ${active
							? "border border-border text-foreground hover:text-foreground hover:bg-jike-yellow/10"
							: "border border-transparent text-muted hover:text-jike-yellow"
							}`}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
